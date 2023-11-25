import OpenAI from 'openai';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {AstraDB} from "@datastax/astra-db-ts";
import { getSkillFromDB, getStudentFromDB, getStudentSkillFromDB, updateStudentSkillScores } from '../../utils/databaseFunctions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

function determineSampleQuestions(relevantScore : number, easyQuestions : string[], mdrtQuestions : string[], hardQuestions : string[]) {
  if (relevantScore < 100.0/3.0) {
    return easyQuestions;
  } else if (relevantScore < 200.0/3.0) {
    return mdrtQuestions;
  } else {
    return hardQuestions;
  }
}

interface Skill {
  subject: string;
  curriculum_point: string;
  skill: string;
  skill_description: string;
  key_ideas: string[];
  key_idea_summaries: string[];
  easy_questions: string[];
  mdrt_questions: string[];
  hard_questions: string[];
  content: string;
  dependencies: string[];
  // ... any other properties
}

interface Student {
  email_address: string;
  interests: string[];
  subjects: string[];
}

interface StudentSkill {
  email_address: string;
  subject: string;
  skill: string;
  mastery_score: number;
  retention_score: number;
  need_to_revise: boolean;
  decay_value: number;
  // ... any other properties
}

export async function POST(req: Request) {
  try {
    const {messages, llm, chatState, skill, email} = await req.json();

    const returnedSkill = await getSkillFromDB(skill, astraDb) as Skill; // response from the DB. Has skill_title, decay_value, dependencies, subject_code, theory

    const returnedStudent = await getStudentFromDB(email, astraDb) as Student; // response from the DB. Has email_address, interests, subjects
    
    const returnedStudentSkill = await getStudentSkillFromDB(email, skill, astraDb) as StudentSkill; // response from the DB. Has email_address, subject_code, skill_title, mastery_score, retention_score, need_to_revise, decay_value
    
    const latestMessage = messages[messages?.length - 1]?.content;

    if (chatState === 'asking') {
      var sampleQuestions : string[];

      if (returnedStudentSkill.need_to_revise) {
        sampleQuestions = determineSampleQuestions(returnedStudentSkill.retention_score, returnedSkill.easy_questions, returnedSkill.mdrt_questions, returnedSkill.hard_questions);
      } else {
        sampleQuestions = determineSampleQuestions(returnedStudentSkill.mastery_score, returnedSkill.easy_questions, returnedSkill.mdrt_questions, returnedSkill.hard_questions);
      }
      
      // console.log(sampleQuestions);
      const questions: string[] = [];

      if (messages.length > 2)
      {
        // Questions have been asked before
        for (let i = 1; i < messages.length; i += 4) {
          questions.push(messages[i].content);
        }
      }

      console.log(`Questions are: ${questions}`)

      const systemPrompt = [ // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
        {
          "role": "system", 
          "content": `You are a professional question writer for textbooks and exams. Your task is to craft a ${returnedSkill.skill} question suitable for an Australian highschool student in year 10-11. Your question should be based on the following information:

          - This is the "key idea" being assessed and what your question explore: ${returnedSkill.key_ideas}.
          - Ensure the question aligns with these complexities and nuances: ${returnedSkill.key_idea_summaries}.
          - Here is some additional theory surrounding the key idea. This information is relevant to helping you formulate the question but you do not have to strictly follow it. Take some personal liberty while still being within the same context governed by the key idea: ${returnedSkill.content}.
          - Student Year Level - It is important you create create a question that is appropriate for this a student at this academic level: Years 10-11.
          - Ensure the question pertains to and enriches understanding in this field: ${returnedSkill.subject}.
          - Difficulty Level - The question's complexity should be similar to those of the following sample questions: ${sampleQuestions}.
          
          Where applicable, embed the student's interests into the question to enhance engagement, however don't force it if it doesn't fit well. If these elements don't directly align with the academic content, focus on the educational aspect.
          
          - Student Interests - Consider these to make the question more engaging: ${returnedStudent.interests}.
          
          Directly pose the question without prefacing it as a 'question' or any thing else like that. The question should be formatted as if it were written in a textbook or exam, ensuring it adheres to the specified difficulty level and educational goals.
          
          Formulate a question that is academically suitable for a student at the Years 10-11 level. Here are some example questions which are about the same key idea and at a similar difficulty. Do not use sample questions directly, they are just meant to be examples of the expected difficulty. Do not return your question in quotes.

          Do not make the question entirely focussed on the users interest - the question should be about the academic content.
          `
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
      // console.log('in route.ts waiting')
      // console.log('latest question was: ' + messages.slice(-2)[0].content)
      // console.log('Answer was: ' + latestMessage)
      // console.log(`Question was: ${messages.slice(-2)[0].content}`)

      const gradeSystemPrompt = [ // Setting up the system prompt
        {
          "role": "system", 
          "content": `You are an AI assistant who is given an answer to a question to give a score out of 100. Do not provide any feedback, and only give the score out of 100 in the following JSON format: 
          {
            "score" : insert_score_here
          }
          The question and relevant theory are as follows:
          QUESTION START
          ${messages.slice(-2)[0].content}
          QUESTION END
          
          THEORY START
          ${returnedSkill.content}
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
      let gradeJsonObject: any;

      try {
        gradeJsonObject = JSON.parse(grade.choices[0].message.content);
        // console.log('Successfully parsed JSON: ' + gradeJsonObject);
        // console.log('grade is: ', gradeJsonObject.score);
      } catch (error) {
        gradeJsonObject = { score: null };
        // console.log('Error parsing JSON: ', error);
        // console.log('Original content:', grade.choices[0].message.content);
      }

      const updateScores = await updateStudentSkillScores(email, skill, returnedStudentSkill.mastery_score, returnedStudentSkill.retention_score, returnedStudentSkill.need_to_revise, returnedStudentSkill.decay_value, gradeJsonObject.score, astraDb);
      // console.log('Updated scores: ' + updateScores);

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

          ANSWER SCORE OUT OF 100: ${gradeJsonObject.score} 
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
      // console.log('waiting')
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
