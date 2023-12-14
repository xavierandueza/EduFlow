import type { NextApiRequest, NextApiResponse } from 'next';
import { StudentResponseRequestBody, ChatAction } from '../../app/utils/interfaces';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default async function handler(req: NextApiRequest | StudentResponseRequestBody, res: NextApiResponse) {
  const {relevantChatMessage, studentResponse, lastAction}: { relevantChatMessage : string, studentResponse : string, lastAction : ChatAction} = req.body;

  let currentChatAction : string = "unknownResponse"; // default value of an unknown response

  let response : ChatCompletion;

  // console.log(`Relevant chat message is ${relevantChatMessage}`);
  // console.log(`Student response is ${studentResponse}`);
  // console.log(`Last Action is: ${lastAction}`);

  if (lastAction === "askingQuestion" || lastAction === "clarifyingQuestion") {
    // openAI call to classify the response
    // console.log("Sending request to OpenAI to classify the response");

    const systemPrompt = [ // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        "role": "system", 
        "content": `You must classify a student response as one of three possible types of answers:
        clarifyingQuestion: A clarifying question on the original question
        gradingValidAnswer: A valid answer to the original question (including an incorrect answer, or an "I don't know")
        gradingInvalidAnswer: An invalid answer to the original question (something not at all related to the original question, and not a clarifying question)

        Return JUST the type of answer as the original camelCase word, with no quotation marks or punctuation. 

        Original question: ${relevantChatMessage}
        `
      },
    ] as ChatCompletionMessageParam[]

    const studentMessage = [
      {
        "role": "user",
        "content": `Student response: ${studentResponse}`
      }
    ] as ChatCompletionMessageParam[]

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create( // Actually sending the request to OpenAI
      {
        model: 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
        messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
        temperature: 0.0,
      }
      );
      console.log("Model classification is: " + response.choices[0].message.content)
      currentChatAction = response.choices[0].message.content; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:"); 
      // console.log(response);

    } catch (error) {
      console.log("Error in sending request to OpenAI");
      res.status(500).json({ error: "Error in OpenAI request" });
    }

    // console.log("Done with try except block");
  } else if (lastAction === "providingExtraFeedback" || lastAction === "gradingValidAnswer" || lastAction === "gradingInvalidAnswer" || lastAction === "unknownResponse") {
    const systemPrompt = [ // Setting up the system prompt - COULD ADD FUNCTION THAT SHOWS ALL PREVIOUS QS AND ASKS NOT TO REPEAT
      {
        "role": "system", 
        "content": `You must classify a student response to feedback as one of three possible types of answers:
        providingExtraFeedback: The student is asking for extra feedback or a clarifying question on the feedback or topic
        askingQuestion: The student indicates that they have accepted the feedback, are ready, or other types of words of agreement/non-objection 
        unknownResponse: A response that does not fit into either of the above. 

        Return JUST the type of answer as the original camelCase word, with no quotation marks or punctuation. 

        Feedback student is responding to: ${relevantChatMessage}
        `
      },
    ] as ChatCompletionMessageParam[]

    const studentMessage = [
      {
        "role": "user",
        "content": `Student response: ${studentResponse}`
      }
    ] as ChatCompletionMessageParam[]

    // console.log("Setup everything for chat completion");

    try {
      response = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          messages: [...systemPrompt, ...studentMessage], // ignore error warning here, it works just fine
          temperature: 0.0,
        }
      );
      console.log("Model classification is: " + response.choices[0].message.content)
      currentChatAction = response.choices[0].message.content; // setting the currentChatAction to the response from OpenAI
      // console.log("The response is:"); 
      // console.log(response);

    } catch (error) {
      console.log("Error in sending request to OpenAI");
      res.status(500).json({ error: "Error in OpenAI request" });
    }
  }

  res.status(200).json({ currentChatAction: currentChatAction});
}
