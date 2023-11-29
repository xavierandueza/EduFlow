import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {AstraDB} from "@datastax/astra-db-ts";
import { getSkillFromDB, getStudentFromDB, getStudentSkillFromDB, updateStudentSkillScores } from '../../utils/databaseFunctions';
import { Skill, Student, StudentSkill } from '../../utils/interfaces';
import { RouteRequestBody } from '../../utils/interfaces';

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

export async function POST(req: Request) {
  try {
    const requestBody = await req.json() as RouteRequestBody;
    const {messages, llm, chatState, skill, email, sessionSkillAggregates} = requestBody;

    if (chatState === 'asking') {
      const returnedSkill = await getSkillFromDB(skill, astraDb) as Skill; // response from the DB. Has skill_title, decay_value, dependencies, subject_code, theory

      const returnedStudent = await getStudentFromDB(email, astraDb) as Student; // response from the DB. Has email_address, interests, subjects
      
      const returnedStudentSkill = await getStudentSkillFromDB(email, skill, astraDb) as StudentSkill; // response from the DB. Has email_address, subject_code, skill_title, mastery_score, retention_score, need_to_revise, decay_value
      
      const latestMessage = messages[messages?.length - 1]?.content;

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
      ] as ChatCompletionMessageParam[]
      // console.log('system prompt is: ' + systemPrompt[0].content)

      const fixedMessage = [
        {
          "role": "user",
          "content": "Ask me a question"
        },
      ] as ChatCompletionMessageParam[]
      
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
      const returnedSkill = await getSkillFromDB(skill, astraDb) as Skill; // response from the DB. Has skill_title, decay_value, dependencies, subject_code, theory

      const returnedStudent = await getStudentFromDB(email, astraDb) as Student; // response from the DB. Has email_address, interests, subjects
      
      const returnedStudentSkill = await getStudentSkillFromDB(email, skill, astraDb) as StudentSkill; // response from the DB. Has email_address, subject_code, skill_title, mastery_score, retention_score, need_to_revise, decay_value
      
      const latestMessage = messages[messages?.length - 1]?.content;
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
      ] as ChatCompletionMessageParam[]

      const userAnswer = [
        {
          "role": "user",
          "content": latestMessage
        },
      ] as ChatCompletionMessageParam[]
      
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
          ${returnedSkill.content}
          THEORY END

          ANSWER SCORE OUT OF 100: ${gradeJsonObject.score} 
          .`
        }
      ] as ChatCompletionMessageParam[]

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
      
    } else if (chatState === 'creating lesson plan') {
      console.log(sessionSkillAggregates)
      // code for pulling out relevant information from the aggregated Skills

      // start by looking at the dependencies stuff. First we want to just get all of the skills that have been selected
      const includedSkillAggregates = sessionSkillAggregates.filter(skill => skill.include_in_class_lesson_plan);
      const totalIncludedSkills = includedSkillAggregates.length;

      let lessonPlanContextString = 'Here are the list of skills and their relevant information:'
      let i = 0;

      for (const includedSkillAggregate of includedSkillAggregates) {
        i++;
        // I basically want to get the relevant information for this skill
        // Start my string

        // Retrieve the skill from the DB
        const currentSkill = await getSkillFromDB(includedSkillAggregate.skill, astraDb);
        lessonPlanContextString += `\n\nSkill Number: ${i} out of ${totalIncludedSkills}: ${currentSkill.skill}\n`;
        lessonPlanContextString += `This skill has the following key Ideas: ${currentSkill.key_ideas}\n`;
        lessonPlanContextString += `Here is the relevant theory on the skill: ${currentSkill.content}\n`;
        
        if (includedSkillAggregate.no_students_not_met_dependencies > 0) {
          lessonPlanContextString += `There are ${includedSkillAggregate.no_students_not_met_dependencies} students who have not met the satisfactory mastery level dependencies for this skill.\n`;
          lessonPlanContextString += `Here are the skills and number of students that have not met dependencies in the skills, that this skill is dependent on:\n`;
          for (const dependency of currentSkill.dependencies) {
            const dependencyAggregate = sessionSkillAggregates.find(skill => skill.skill === dependency);
            if (dependencyAggregate.no_students_not_met_mastery > 0) {
              lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.no_students_not_met_mastery}\n`;
            }
            lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.no_students_not_met_mastery}\n`;
          }
        }

        let insertedRevisionDependencyText = false;

        if (currentSkill.dependencies.length > 0) {
          // Need to check the retention of the dependencies
          for (const dependency of currentSkill.dependencies) {
            const dependencyAggregate = sessionSkillAggregates.find(skill => skill.skill === dependency);
            if (dependencyAggregate.no_students_to_revise > 0) {
              if (!insertedRevisionDependencyText) {
                lessonPlanContextString += `This skill has some skills that it is dependent on, which students need to revise. Here is the list of those skills, and the number of students needing to revise them:\n`;
                insertedRevisionDependencyText = true;
              }
            lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.no_students_not_met_mastery}\n`;
          }
        }
      }

      console.log(lessonPlanContextString)

      // console.log('waiting')
      const classLessonPlanSystemPrompt = [
        {
          "role": "system", 
          "content": `You are an AI assistant who provides expert lesson plans to teachers, helping them cater their content to the needs of their students. 
          You have been given a list of skills to be included in the lesson, and their relevant information. This also includes the key ideas of the skill(s), and the theory relating to the skill(s). 
          You may also be warned that some students have not met the satisfactory mastery level for skills that this skill is dependent on. A skill that is depedent on another indicates that the dependee skill is a prerequisite for the dependent skill.
          If this is the case, then please provide a note on the major dependent skills that students are lacking in for the teacher. 
            
          The question and relevant theory are as follows:
          RELEVANT INFORMATION START
          ${lessonPlanContextString}
          RELEVANT INFORMATION END

          Break down your lesson plan into the following components:
          - Learning intention: What is the skill that the student is learning in the class. Phrase as a "we are learning... "
          - Success criteria: What should the student be capable of after the class, that they weren't capable of before. These must be worded as "I can" statements, from the perspective of the student, in terms of what they can do after they have completed the class
          - Key questions: Good starters to prompt the class when you start off, motivating learning
          - Introduction section (10 minutes): Provide an outline of the introduction, discussing learning intention, success criteria, any activities you may do in this period
          - The main activity (25 minutes): Provide a summary of whjat the main classroom activity will be
          - Materials: What you need to conduct the lesson
          - closure (10 minutes): Provide an summary that reflects on class learnings, including what strategies were used to gain knowledge.
          - rational: Why this has been the approach to the class.

          Use markdown where appropriate. Do not return your lesson plan in quotes.
          `
        }
      ] as ChatCompletionMessageParam[]

      const response = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...classLessonPlanSystemPrompt, ...messages], // combine the system prompt with the latest message
        }
      );
      
      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse

    }
  }  
  } catch (e) { // error handling
    throw e;
  }
}
