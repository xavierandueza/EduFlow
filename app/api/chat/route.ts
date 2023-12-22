import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  getSchoolClassSkillFromDB,
  getStudentFromDB,
  updateStudentSkillScore,
} from "../../utils/databaseFunctionsFirestore";
import {
  SchoolClassSkill,
  FirestoreStudent,
  FirestoreStudentSkill,
  ChatAction,
  QuestionType,
} from "../../utils/interfaces";
import { RouteRequestBody } from "../../utils/interfaces";
import { getStudentChatAction } from "../../../pages/api/getStudentChatAction";
import { db } from "../../firebase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Andrew: post sends information to the client
export async function POST(req: Request) {
  try {
    const requestBody = (await req.json()) as RouteRequestBody;
    const {
      messages,
      llm,
      lastChatAction,
      studentSkill,
      sessionSkillAggregates,
      relevantMessagesStartIndex,
      onFeedbackLoopCounter,
      onQuestionLoopCounter,
      myChatAction,
    } = requestBody;

    let chatAction: ChatAction;
    let relevantChatMessage: string;

    // get messages that are in the current Q+A string
    const relevantMessages = messages.slice(relevantMessagesStartIndex);

    // setting the chatAction
    if (myChatAction !== "creatingLessonPlan") {
      if (relevantMessages.length === 1) {
        // only one message, so chatAction is askingQuestion
        chatAction = "askingQuestion";
      } else {
        // there is a chat action to speak of
        // the relevant chat action is dependent on where you're at actually
        if (
          lastChatAction === "askingQuestion" ||
          lastChatAction === "clarifyingQuestion"
        ) {
          // last chat action is the chat question itself
          relevantChatMessage = relevantMessages[1].content;
        } else if (
          lastChatAction === "gradingValidAnswer" ||
          lastChatAction === "gradingInvalidAnswer" ||
          lastChatAction === "providingExtraFeedback" ||
          lastChatAction === "unknownResponse"
        ) {
          // relevant message is the last piece of feedback provided
          console.log("Total relevant messages: " + relevantMessages.length);
          console.log(
            "Last feedback point index:" +
              (3 + onQuestionLoopCounter * 2 + onFeedbackLoopCounter * 2),
          );
          relevantChatMessage =
            relevantMessages[
              3 + onQuestionLoopCounter * 2 + onFeedbackLoopCounter * 2
            ].content;
        }
        chatAction = await getStudentChatAction(
          relevantChatMessage,
          messages[messages.length - 1].content,
          lastChatAction,
        );
      }
    } else {
      chatAction = "creatingLessonPlan";
    }

    console.log("Chat action is: " + chatAction);

    if (chatAction === "askingQuestion") {
      // console.log("Asking a question")
      // get the skill, the student from the db
      const schoolClassSkill = (await getSchoolClassSkillFromDB(
        studentSkill.skillID,
      )) as SchoolClassSkill;
      console.log("School class skill is: " + schoolClassSkill.skill);

      const student = (await getStudentFromDB(
        studentSkill.studentID,
      )) as FirestoreStudent;
      console.log("Student is: " + student);

      const questions: string[] = [];

      // Get the question type from the imported questionTypes list, and the mastery score:
      let questionType: QuestionType;

      if (studentSkill.masteryScore <= 25) {
        const possibleTypes: QuestionType[] = [
          "trueOrFalseTrue",
          "provideADefinition",
          "trueOrFalseFalse",
        ];
        questionType =
          possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      } else if (studentSkill.masteryScore <= 50) {
        const possibleTypes: QuestionType[] = [
          "multipleChoiceSingleTrue",
          "multipleChoiceSingleFalse",
          "trueOrFalseFalse",
        ];
        questionType =
          possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      } else if (studentSkill.masteryScore <= 75) {
        const possibleTypes: QuestionType[] = [
          "multipleChoiceMultipleTrue",
          "multipleChoiceMultipleFalse",
          "shortAnswer",
          "trueOrFalseFalse",
        ];
        questionType =
          possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      } else if (studentSkill.masteryScore <= 100) {
        const possibleTypes: QuestionType[] = ["shortAnswer", "longAnswer"];
        questionType =
          possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      } else {
        console.error("Invalid mastery score");
      }

      let questionAskingString = "";

      if (questionType === "trueOrFalseTrue") {
        questionAskingString +=
          "True or False. From the theory, generate a true statement, and ask the user to determine whether it is true or false";
      } else if (questionType === "provideADefinition") {
        questionAskingString +=
          "Ask the user to provide a definition of a relevant point from the theory.";
      } else if (questionType === "trueOrFalseFalse") {
        questionAskingString +=
          "True or False. From the theory, generate a false statement, and ask the user to determine whether it is true or false";
      } else if (questionType === "multipleChoiceSingleTrue") {
        questionAskingString +=
          "From the theory, generate a correct statement, and 3 incorrect statements, and ask the student to select the correct statement. Randomly order the statements from a) to d)";
      } else if (questionType === "multipleChoiceSingleFalse") {
        questionAskingString +=
          "From the theory Generate 3 correct statements, and 1 incorrect statement and ask the user to select the incorrect statement. Randomly order the statements from a) to d)";
      } else if (questionType === "multipleChoiceMultipleTrue") {
        questionAskingString +=
          "Of 4 total statements based off of the theory generate 1 or more correct statements, with the rest being false, and ask the user to select all correct statements. Randomly order the statements from a) to d)";
      } else if (questionType === "multipleChoiceMultipleFalse") {
        questionAskingString +=
          "Multiple Choice (Multiple False). From the theory generate 4 statements, with 1 or more being incorrect, and ask the user to select all incorrect statements. Randomly order the statements from a) to d)";
      } else if (questionType === "shortAnswer") {
        questionAskingString +=
          "Ask the student a question on the theory that can be answered in a few sentences. This question should not be multi-part.";
      } else if (questionType === "longAnswer") {
        questionAskingString +=
          "Ask the student a question on the theory that can be answered in one or two paragraphs. This question can be multi-part, or extended";
      } else {
        questionAskingString +=
          "Generate a question based on the theory, and ask the student to answer it.";
      }

      // console.log(`Question type is: ${questionAskingString}`)

      const systemPrompt = [
        // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
        {
          role: "system",
          content: `You are a professional question writer for textbooks and exams. Your task is to craft a ${studentSkill.skill} question suitable for an Australian highschool student in year 10-11. Your question should be based on the following information:

          - This is the "key idea" being assessed and what your question explore: ${schoolClassSkill.keyIdeas}.
          - Ensure the question aligns with these complexities and nuances: ${schoolClassSkill.keyIdeasSummary}.
          - Here is some additional theory surrounding the key idea. This information is relevant to helping you formulate the question but you do not have to strictly follow it. Take some personal liberty while still being within the same context governed by the key idea: ${schoolClassSkill.content}.
          - Student Year Level - It is important you create create a question that is appropriate for this a student at this academic level: Years 10-11.
          - Ensure the question pertains to and enriches understanding in this field: ${schoolClassSkill.subject}.
          
          Where applicable, embed the student's interests into the question to enhance engagement, however don't force it if it doesn't fit well. If these elements don't directly align with the academic content, focus on the educational aspect.
          
          - Student Interests - Consider these to make the question more engaging: ${student.interests}.
          
          Directly pose the question without prefacing it as a 'question'. The question should be formatted as if it were written in a textbook or exam, ensuring it adheres to the specified difficulty level and educational goals.

          Follow these specific instructions when generating your question:
          ${questionAskingString}
          `,
        },
      ] as ChatCompletionMessageParam[];
      // console.log('system prompt is: ' + systemPrompt[0].content)

      const fixedMessage = [
        {
          role: "user",
          content: "Ask me a question",
        },
      ] as ChatCompletionMessageParam[];

      // Create the response
      const response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...systemPrompt, ...fixedMessage], // ignore error warning here, it works just fine
        },
      );

      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
    } else if (chatAction === "clarifyingQuestion") {
      // console.log("Clarifying the question")
      // Provide extra feedback
      const schoolClassSkill = (await getSchoolClassSkillFromDB(
        studentSkill.skillID,
      )) as SchoolClassSkill;

      // console.log(`onQuestionLoopCounter is: ${onQuestionLoopCounter}`)
      // console.log(`Original question start: ${relevantMessages[1].content}`)
      // console.log(``)

      const feedbackSystemPrompt = [
        {
          role: "system",
          content: `You are an expert ${schoolClassSkill.subject} AI assistant who assists students on the topic of ${schoolClassSkill.skill}.
          You have already asked the student a question, and the student is currently clarifying the question with you. 
 
          ORIGINAL QUESTION START
          ${relevantMessages[1].content}
          ORIGINAL QUESTION END
          
          TOPIC THEORY START
          ${schoolClassSkill.content}
          TOPIC THEORY END
          
          Provide a response to the student that helps clarify the question without providing an answer. Keep your answer succinct, and focus on answering the student's question.
          .`,
        },
      ] as ChatCompletionMessageParam[];

      const studentResponse = [
        {
          role: "user",
          content: relevantMessages.slice(-1)[0].content,
        },
      ] as ChatCompletionMessageParam[];

      // Create the response
      const response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...feedbackSystemPrompt, ...studentResponse], // combine the system prompt with the latest message
        },
      );

      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
    } else if (
      chatAction === "gradingValidAnswer" ||
      chatAction === "gradingInvalidAnswer"
    ) {
      const schoolClassSkill = (await getSchoolClassSkillFromDB(
        studentSkill.skillID,
      )) as SchoolClassSkill;

      const student = (await getStudentFromDB(
        studentSkill.studentID,
      )) as FirestoreStudent;

      const latestMessage =
        relevantMessages[relevantMessages?.length - 1]?.content;
      // console.log('in route.ts waiting')
      // console.log('latest question was: ' + messages.slice(-2)[0].content)
      // console.log('Answer was: ' + latestMessage)
      // console.log(`Question was: ${messages.slice(-2)[0].content}`)

      const gradeSystemPrompt = [
        // Setting up the system prompt
        {
          role: "system",
          content: `You are an AI assistant who is given an answer to a question to give a score out of 100. Do not provide any feedback, and only give the score out of 100 in the following JSON format: 
          "
          {
            "score" : insert_score_here
          }
          "
          Do not return the JSON object within quotes, and do not return any other text.
          The question and relevant theory are as follows:
          QUESTION START
          ${relevantMessages[1].content}
          QUESTION END
          
          THEORY START
          ${schoolClassSkill.content}
          THEORY END
          .`,
        },
      ] as ChatCompletionMessageParam[];

      let studentAnswer: ChatCompletionMessageParam[];

      if (chatAction === "gradingValidAnswer") {
        // console.log("Responding to a valid response")
        studentAnswer = [
          {
            role: "user",
            content: "The student's answer is: " + latestMessage,
          },
        ] as ChatCompletionMessageParam[];
      } else {
        // console.log("Responding to an invalid response")
        studentAnswer = [
          {
            role: "user",
            content: "I don't know.",
          },
        ] as ChatCompletionMessageParam[];
      }

      const grade = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...gradeSystemPrompt, ...studentAnswer], // combine the system prompt with the latest message
        },
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

      const updateScores = await updateStudentSkillScore(
        studentSkill,
        gradeJsonObject.score,
      );
      // console.log('Updated scores: ' + updateScores);

      const feedbackSystemPrompt = [
        {
          role: "system",
          content: `You are an AI assistant who is given an answer to a question, and the score it was marked as out of 100.
          Provide feedback to the student on their answer, and word this in the 2nd person, as if the student is reading it.
          The question and relevant theory are as follows:
          QUESTION START
          ${relevantMessages[1].content}
          QUESTION END
          
          THEORY START
          ${schoolClassSkill.content}
          THEORY END

          ANSWER SCORE OUT OF 100: ${gradeJsonObject.score} 

          Do not tell the student their score, just let them know whether they got the question correct or incorrect, where scores of less than 60 are incorrect.
          Keep your feedback short and succinct, focusing on major areas of improvement if any exist.
          Do not add in extra flavouring text. Do not return your feedback in quotes.
          .`,
        },
      ] as ChatCompletionMessageParam[];

      // Create the response
      const response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...feedbackSystemPrompt], // combine the system prompt with the latest message
        },
      );

      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
    } else if (chatAction === "providingExtraFeedback") {
      // console.log("Providing extra feedback")
      // Provide extra feedback
      const schoolClassSkill = await getSchoolClassSkillFromDB(
        studentSkill.skillID,
      );

      // TO DO
      // - Need to get a way of determining how many loops we've been in for non-question answer chain
      // - Need to drop that into the feedbackSystemPrompt

      // console.log(`onFeedbackLoopCounter is: ${onFeedbackLoopCounter}`)
      // console.log(`Original question start: ${relevantMessages[1].content}`)

      // console.log(`Student Answer Start: ${relevantMessages[2 + onFeedbackLoopCounter*2].content}`)
      // console.log(`Student Answer End: ${relevantMessages[3 + onFeedbackLoopCounter*2].content}`)

      // get the feedback as a single prompt
      let existingFeedback =
        "Feedback #1: " +
        relevantMessages[3 + onQuestionLoopCounter * 2].content;

      for (let i = 0; i < onFeedbackLoopCounter; i++) {
        existingFeedback +=
          `\nFeedback #${i + 2}: ` +
          relevantMessages[3 + onQuestionLoopCounter * 2 + i * 2].content;
      }

      const feedbackSystemPrompt = [
        {
          role: "system",
          content: `You are an AI assistant who assists students on the topic of ${
            schoolClassSkill.subject
          }.
          The student has answered a question, and you have graded their answer and given feedback.

          The student has asked a further clarifying question on the feedback, question, or broader topic.
 
          ORIGINAL QUESTION START
          ${relevantMessages[1].content}
          ORIGINAL QUESTION END
          
          TOPIC THEORY START
          ${schoolClassSkill.content}
          TOPIC THEORY END

          STUDENT ANSWER START
          ${relevantMessages[2 + onQuestionLoopCounter * 2].content}
          STUDENT ANSWER END

          FEEDBACK TO ANSWER START
          ${
            relevantMessages[
              3 + onQuestionLoopCounter * 2 + onFeedbackLoopCounter * 2
            ].content
          }
          FEEDBACK TO ANSWER END 
          
          Provide a response to the student, and word this in the 2nd person, as if the student is reading it.
          .`,
        },
      ] as ChatCompletionMessageParam[];

      const studentResponse = [
        {
          role: "user",
          content: relevantMessages.slice(-1)[0].content,
        },
      ] as ChatCompletionMessageParam[];

      // Create the response
      const response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...feedbackSystemPrompt, ...studentResponse], // combine the system prompt with the latest message
        },
      );

      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
    } else if (chatAction === "unknownResponse") {
      // console.log("Responding to an invalid response")
      const feedbackSystemPrompt = [
        {
          role: "system",
          content: `You are an AI assistant who assists students in their learning.
          You have been provided an unknown response, if it is appropriate to provide some sort of response to, do so, however ensure that you ask whether the student has any more questions, or would like to move on.
          .`,
        },
      ] as ChatCompletionMessageParam[];

      const studentResponse = [
        {
          role: "user",
          content: relevantMessages.slice(-1)[0].content,
        },
      ] as ChatCompletionMessageParam[];

      // Create the response
      const response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [...feedbackSystemPrompt, ...studentResponse], // combine the system prompt with the latest message
        },
      );

      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse

    } else if (chatAction === "creatingLessonPlan") {
      // console.log(sessionSkillAggregates)
      // code for pulling out relevant information from the aggregated Skills

      // start by looking at the dependencies stuff. First we want to just get all of the skills that have been selected
      const includedSkillAggregates = sessionSkillAggregates.filter(
        (skill) => skill.includeInLessonPlan,
      );
      const totalIncludedSkills = includedSkillAggregates.length;

      let lessonPlanContextString =
        "Here are the list of skills and their relevant information:";
      let i = 0;

      for (const includedSkillAggregate of includedSkillAggregates) {
        i++;
        // I basically want to get the relevant information for this skill
        // Start my string

        // Retrieve the skill from the DB
        console.log("Current skill is: ");
        console.log(includedSkillAggregate.skill);
        const currentSkill = await getSchoolClassSkillFromDB(
          null,
          includedSkillAggregate.schoolClass,
          includedSkillAggregate.skill,
        ); // NO CLUE IF THIS WORKS PROBS DOESN'T

        lessonPlanContextString += `\n\nSkill Number: ${i} out of ${totalIncludedSkills}: ${currentSkill.skill}\n`;
        lessonPlanContextString += `This skill has the following key Ideas: ${currentSkill.keyIdeas}\n`;
        lessonPlanContextString += `Here is the relevant theory on the skill: ${currentSkill.content}\n`;

        if (includedSkillAggregate.noStudentsNotMetDependencies > 0) {
          lessonPlanContextString += `There are ${includedSkillAggregate.noStudentsNotMetDependencies} students who have not met the satisfactory mastery level dependencies for this skill.\n`;
          lessonPlanContextString += `Here are the skills and number of students that have not met dependencies in the skills, that this skill is dependent on:\n`;
          for (const dependency of currentSkill.dependencies) {
            const dependencyAggregate = sessionSkillAggregates.find(
              (skill) => skill.skill === dependency,
            );
            if (dependencyAggregate.noStudentsNotMetMastery > 0) {
              lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.noStudentsNotMetMastery}\n`;
            }
            lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.noStudentsNotMetMastery}\n`;
          }
        }

        let insertedRevisionDependencyText = false;

        if (currentSkill.dependencies.length > 0) {
          // Need to check the retention of the dependencies
          for (const dependency of currentSkill.dependencies) {
            const dependencyAggregate = sessionSkillAggregates.find(
              (skill) => skill.skill === dependency,
            );
            if (dependencyAggregate.noStudentsToRevise > 0) {
              if (!insertedRevisionDependencyText) {
                lessonPlanContextString += `This skill has some skills that it is dependent on, which students need to revise. Here is the list of those skills, and the number of students needing to revise them:\n`;
                insertedRevisionDependencyText = true;
              }
              lessonPlanContextString += `${dependencyAggregate.skill}: ${dependencyAggregate.noStudentsNotMetMastery}\n`;
            }
          }
        }

        // console.log(lessonPlanContextString)

        // console.log('waiting')
        const classLessonPlanSystemPrompt = [
          {
            role: "system",
            content: `You are an AI assistant who provides expert lesson plans to teachers, helping them cater their content to the needs of their students. 
            You have been given a list of skills to be included in the lesson, and their relevant information. This also includes the key ideas of the skill(s), and the theory relating to the skill(s). 
            You may also be warned that some students have not met the satisfactory mastery level for skills that this skill is dependent on. A skill that is dependent on another indicates that the dependee skill is a prerequisite for the dependent skill.
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
            - The main activity (25 minutes): Provide a summary of what the main classroom activity will be
            - Materials: What you need to conduct the lesson
            - closure (10 minutes): Provide an summary that reflects on class learnings, including what strategies were used to gain knowledge.
            - rational: Why this has been the approach to the class.

            Use markdown where appropriate. Do not return your lesson plan in quotes.
            `,
          },
        ] as ChatCompletionMessageParam[];

        const response = await openai.chat.completions.create(
          // Actually sending the request to OpenAI
          {
            model: llm ?? "gpt-3.5-turbo", // defaults to gpt-3.5-turbo if llm is not provided
            stream: true, // streaming YAY
            messages: [...classLessonPlanSystemPrompt, ...messages], // combine the system prompt with the latest message
          },
        );

        const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
        return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
      }
    }
  } catch (e) {
    // error handling
    throw e;
  }
}
