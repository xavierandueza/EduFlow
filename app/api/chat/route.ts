import OpenAI from 'openai';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {AstraDB} from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

async function getSkillFromDB(skill : string) {
  try {
    const collection = await astraDb.collection('skills_vec');
    const dbResponse = await collection.findOne({ skill_title: skill });
    return dbResponse || ''; // Return the response or an empty string if no skill is found
  } catch (error) {
    console.error('Error fetching skill:', error);
    return ''; // Return an empty string in case of an error
  }
}

async function getStudentFromDB(email : string) {
  try {
    const collection = await astraDb.collection('students_vec');
    const dbResponse = await collection.findOne({ email_address: email });
    return dbResponse || ''; // Return the response or an empty string if no skill is found
  } catch (error) {
    console.error('Error fetching student:', error);
    return ''; // Return an empty string in case of an error
  }
}

async function getStudentSkillFromDB(email : string, skill : string) {
  try {
    const collection = await astraDb.collection('student_skills_vec');
    const dbResponse = await collection.findOne({ email_address: email, skill_title: skill });
    return dbResponse || ''; // Return the response or an empty string if no skill is found
  } catch (error) {
    console.error('Error fetching student skill:', error);
    return ''; // Return an empty string in case of an error
  }
}


export async function POST(req: Request) {
  try {
    const {messages, useRag, llm, similarityMetric, chatState, skill, email} = await req.json();
    // console.log('running the route.ts file');
    // console.log(messages);
    // console.log('Chat State is: ' + chatState);
    // console.log('Skill is: ' + skill);
    // console.log(email);
    const returnedSkill = await getSkillFromDB(skill); // response from the DB. Has skill_title, decay_value, dependencies, subject_code, theory
    const returnedStudent = await getStudentFromDB(email); // response from the DB. Has email_address, interests, subjects
    const returnedStudentSkill = await getStudentSkillFromDB(email, skill); // response from the DB. Has email_address, subject_code, skill_title, mastery_score, retention_score, need_to_revise, decay_value
    // console.log(`Returned student with email: ${returnedStudent.email_address} and interests: ${returnedStudent.interests}`);
    // console.log('Returned skill is: ' + returnedSkill.skill_title); // check the skill response IGNORE ERROR WARNING
    console.log(`Returned student: ${returnedStudentSkill.email_address}
    subject code: ${returnedStudentSkill.subject_code}
    skill title: ${returnedStudentSkill.skill_title}
    mastery score: ${returnedStudentSkill.mastery_score}
    retention score: ${returnedStudentSkill.retention_score}
    need to revise: ${returnedStudentSkill.need_to_revise}
    decay value: ${returnedStudentSkill.decay_value}`);
    
    const latestMessage = messages[messages?.length - 1]?.content;

    if (chatState === 'asking') {
      console.log('asking on the route.ts')

      const systemPrompt = [ // Setting up the system prompt
        {
          "role": "system", 
          "content": `You are an AI assistant who asks a questions to the student, based off of the given theory:
          THEORY START
          ${returnedSkill.theory}
          THEORY END
          Where possible, also relate the question to the student's interests, as listed here: ${returnedStudent.interests}` // ignore error warning above, no problem with it
        },
      ]
      // console.log('system prompt is: ' + systemPrompt[0].content)

      const fixedMessage = [
        {
          "role": "user",
          "content": "Ask me a question"
        },
      ]
      
      // Create the response
      const response = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...systemPrompt, ...fixedMessage], // ignore error warning here, it works just fine
        }
      );
      
      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse

    } else if (chatState === 'waiting') {
      console.log('in route.ts waiting')
      console.log('latest question was: ' + messages.slice(-2)[0].content)
      console.log('Answer was: ' + latestMessage)

      const gradeSystemPrompt = [ // Setting up the system prompt
        {
          "role": "system", 
          "content": `You are an AI assistant who is given an answer to a question to give a score out of 100. Return it in the following JSON format:
          {
            "score" : insert_score_here
          }
          The question and relevant theory are as follows:
          QUESTION START
          ${messages.slice(-2)[0].content}
          QUESTION END
          
          THEORY START
          ${returnedSkill.theory}
          THEORY END
          .`
        },
      ]

      const userAnswer = [
        {
          "role": "user",
          "content": latestMessage
        },
      ]
      
      const grade = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...gradeSystemPrompt, ...userAnswer], // combine the system prompt with the latest message
        }
      );
      console.log('grade is: ' + grade.choices[0].message.content)
      let jsonObject: any;

      try {
        jsonObject = JSON.parse(grade.choices[0].message.content);
        console.log('Successfully parsed JSON: ' + jsonObject);
        console.log('grade is: ', jsonObject.score);
      } catch (error) {
        jsonObject = { score: null };
        console.log('Error parsing JSON: ', error);
        console.log('Original content:', grade.choices[0].message.content);
      }

      const feedbackSystemPrompt = [
        {
          "role": "system", 
          "content": `You are an AI assistant who is given an answer to a question, and the score it was provided out of 100.
          Provide feedback to the student on their answer, and word this in the 2nd person, as if the student is reading it.
          The question and relevant theory are as follows:
          QUESTION START
          ${messages.slice(-2)[0].content}
          QUESTION END
          
          THEORY START
          ${returnedSkill.theory}
          THEORY END

          ANSWER SCORE OUT OF 100: ${jsonObject.score} 
          .`
        }
      ]

      // Create the response
      const response = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...feedbackSystemPrompt], // combine the system prompt with the latest message
        }
      );
      
      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
      
    } else if (chatState === 'grading') {
      console.log('waiting')
      const systemPrompt = [ // Setting up the system prompt
      {
        role: 'system',
        content: `You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable.`,
      },
    ]
    }
    
  } catch (e) { // error handling
    throw e;
  }
}
