import type { NextApiRequest, NextApiResponse } from "next";
import {
  StudentResponseRequestBody,
  ChatAction,
} from "../../app/utils/interfaces";
import OpenAI from "openai";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default async function handler(
  req: NextApiRequest | StudentResponseRequestBody,
  res: NextApiResponse
) {
  const {
    relevantChatMessage,
    studentResponse,
    lastAction,
  }: {
    relevantChatMessage: string;
    studentResponse: string;
    lastAction: ChatAction;
  } = req.body;
  // console.log("Relevant chat message is: " + relevantChatMessage);
  // console.log("Student response is: " + studentResponse);
  // console.log("Last action is: " + lastAction);

  let currentChatAction: ChatAction = "unknownResponse"; // default value of an unknown response

  let response: ChatCompletion;

  // console.log(`Relevant chat message is ${relevantChatMessage}`);
  // console.log(`Student response is ${studentResponse}`);
  // console.log(`Last Action is: ${lastAction}`);

  if (lastAction === "askingQuestion" || lastAction === "clarifyingQuestion") {
    // openAI call to classify the response
    // console.log("Sending request to OpenAI to classify the response");

    const systemPrompt = [
      // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        role: "system",
        content: `You are a helpful AI assistant who classifies messages between a student and an AI teacher having a text conversation. The teacher has just taken one of the following actions:

        1. The teacher has either just asked the student an exam-style question or
        2.  the teacher has provided clarification on the exam-style question after the student has asked for some or provided additional clarification on any previous clarification already provided
        
        The student has just responded in one of three ways, labelled as "gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer", and are defined as :
        
        1.  "gradingValidAnswer":  The student has answered the exam-style question with a valid answer (including incorrect answers and answers such as "I don't know" or "I don't get it") 
        2. "clarifyingQuestion": The student has yet to directly provide an answer to the question but is instead asking for clarification regarding the original exam-style question the teacher AI has asked or previous clarification the AI teacher has provided.
        3. "gradingInvalidAnswer": The student has responded in a way that is irrelevant and doesn't fit into any of the above two categories
        
        your task is to determine which of the three possible responses the student has provided ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer")
        
        Here is the original question the teacher has posed to the student: "${relevantChatMessage}"
        
        Your response should ONLY be one of the original camel case words ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer") with no quotation marks or punctuation.
        `,
      },
    ] as ChatCompletionMessageParam[];

    const studentMessage = [
      {
        role: "user",
        content: `Student response: ${studentResponse}`,
      },
    ] as ChatCompletionMessageParam[];

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: "gpt-4-1106-preview", // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
          temperature: 0.0,
        }
      );
      currentChatAction = response.choices[0].message.content as ChatAction; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:");
      // console.log(response);
    } catch (error) {
      console.log("Error in sending request to OpenAI");
      res.status(500).json({ error: "Error in OpenAI request" });
    }

    // console.log("Done with try except block");
  } else if (
    lastAction === "providingExtraFeedback" ||
    lastAction === "gradingValidAnswer" ||
    lastAction === "gradingInvalidAnswer" ||
    lastAction === "unknownResponse"
  ) {
    const systemPrompt = [
      // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        role: "system",
        content: `You are a helpful AI assistant who classifies messages between a student and an AI teacher having a text conversation.  So far the AI teacher has provided the student with an exam-styled question, the student has answered the exam-styled question and the AI teacher has just provided the following feedback on the student's answer to the exam-styled question:

        "${relevantChatMessage}"
        
        The student has just responded to this feedback in one of three ways, labelled as either "providingExtraFeedback", "askingQuestion", or  "unknownResponse", and are defined as :
        
        1.  "providingExtraFeedback":  The student is asking for additional feedback, or is asking for clarification about either the feedback that the AI teacher has provided or the topic of the exam-styled question itself
        2. "askingQuestion": The student indicates that they have accepted the feedback, are ready for the next question, or other types of words of agreement/non-objection that indicate they are ready for another question 
        3. "unknownResponse": The student has responded in a way that is irrelevant and doesn't fit into any of the above two categories
        
        your task is to determine which of the three possible responses the student has provided ("providingExtraFeedback", "askingQuestion", or  "unknownResponse")
        
        Your response should ONLY be one of the original camel case words ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer") with no quotation marks or punctuation. 
        `,
      },
    ] as ChatCompletionMessageParam[];

    const studentMessage = [
      {
        role: "user",
        content: `Student response: ${studentResponse}`,
      },
    ] as ChatCompletionMessageParam[];

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: "gpt-4-1106-preview", // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
          temperature: 0.0,
        }
      );
      console.log(
        "Model classification is: " + response.choices[0].message.content
      );
      currentChatAction = response.choices[0].message.content as ChatAction; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:");
      // console.log(response);
    } catch (error) {
      console.log("Error in sending request to OpenAI");
      res.status(500).json({ error: "Error in OpenAI request" });
    }
  }

  res.status(200).json({ currentChatAction: currentChatAction });
}

export async function getStudentChatAction(
  relevantChatMessage: string,
  studentResponse: string,
  lastAction: ChatAction
) {
  console.log("Relevant chat message is: " + relevantChatMessage);
  console.log("Student response is: " + studentResponse);
  console.log("Last action is: " + lastAction);

  let currentChatAction: ChatAction = "unknownResponse"; // default value of an unknown response

  let response: ChatCompletion;

  // console.log(`Relevant chat message is ${relevantChatMessage}`);
  // console.log(`Student response is ${studentResponse}`);
  // console.log(`Last Action is: ${lastAction}`);

  if (lastAction === "askingQuestion" || lastAction === "clarifyingQuestion") {
    // openAI call to classify the response
    // console.log("Sending request to OpenAI to classify the response");

    const systemPrompt = [
      // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        role: "system",
        content: `You are a helpful AI assistant who classifies messages between a student and an AI teacher having a text conversation. The teacher has just taken one of the following actions:

        1. The teacher has either just asked the student an exam-style question or
        2.  the teacher has provided clarification on the exam-style question after the student has asked for some or provided additional clarification on any previous clarification already provided
        
        The student has just responded in one of three ways, labelled as "gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer", and are defined as :
        
        1.  "gradingValidAnswer":  The student has answered the exam-style question with a valid answer (including incorrect answers and answers such as "I don't know" or "I don't get it") 
        2. "clarifyingQuestion": The student has yet to directly provide an answer to the question but is instead asking for clarification regarding the original exam-style question the teacher AI has asked or previous clarification the AI teacher has provided.
        3. "gradingInvalidAnswer": The student has responded in a way that is irrelevant and doesn't fit into any of the above two categories
        
        your task is to determine which of the three possible responses the student has provided ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer")
        
        Here is the original question the teacher has posed to the student: "${relevantChatMessage}"
        
        Your response should ONLY be one of the original camel case words ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer") with no quotation marks or punctuation.
        `,
      },
    ] as ChatCompletionMessageParam[];

    const studentMessage = [
      {
        role: "user",
        content: `Student response: ${studentResponse}`,
      },
    ] as ChatCompletionMessageParam[];

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: "gpt-4-1106-preview", // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
          temperature: 0.0,
        }
      );
      currentChatAction = response.choices[0].message.content as ChatAction; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:");
      // console.log(response);
    } catch (error) {
      console.log("Error in sending request to OpenAI");
      throw error;
    }

    // console.log("Done with try except block");
  } else if (
    lastAction === "providingExtraFeedback" ||
    lastAction === "gradingValidAnswer" ||
    lastAction === "gradingInvalidAnswer" ||
    lastAction === "unknownResponse"
  ) {
    const systemPrompt = [
      // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        role: "system",
        content: `You are a helpful AI assistant who classifies messages between a student and an AI teacher having a text conversation.  So far the AI teacher has provided the student with an exam-styled question, the student has answered the exam-styled question and the AI teacher has just provided the following feedback on the student's answer to the exam-styled question (or additional feedback on the student's response to the previous feedback):

        "${relevantChatMessage}"
        
        The student has just responded to this feedback in one of three ways, labelled as either "providingExtraFeedback", "askingQuestion", or  "unknownResponse", and are defined as :
        
        1.  "providingExtraFeedback":  The student is asking for additional feedback, or is asking for clarification about either the feedback that the AI teacher has provided or the topic of the exam-styled question itself
        2. "askingQuestion": The student indicates that they have accepted the feedback, are ready for the next question, or other types of words of agreement/non-objection that indicate they are ready for another question 
        3. "unknownResponse": The student has responded in a way that is irrelevant and doesn't fit into any of the above two categories
        
        your task is to determine which of the three possible responses the student has provided ("providingExtraFeedback", "askingQuestion", or  "unknownResponse")
        
        Your response should ONLY be one of the original camel case words ("gradingValidAnswer", "clarifyingQuestion", or  "gradingInvalidAnswer") with no quotation marks or punctuation. 
        `,
      },
    ] as ChatCompletionMessageParam[];

    const studentMessage = [
      {
        role: "user",
        content: `Student response: ${studentResponse}`,
      },
    ] as ChatCompletionMessageParam[];

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create(
        // Actually sending the request to OpenAI
        {
          model: "gpt-4-1106-preview", // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
          temperature: 0.0,
        }
      );
      console.log(
        "Model classification is: " + response.choices[0].message.content
      );
      currentChatAction = response.choices[0].message.content as ChatAction; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:");
      // console.log(response);
    } catch (error) {
      console.log("Error in sending request to OpenAI");
      throw error;
    }
  }

  return currentChatAction;
}
