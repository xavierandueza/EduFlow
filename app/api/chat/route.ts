import OpenAI from 'openai';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {AstraDB} from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

export async function POST(req: Request) {
  try {
    const {messages, useRag, llm, similarityMetric, chatState} = await req.json();
    console.log('running the route.ts file')

    const latestMessage = messages[messages?.length - 1]?.content;

    // set up the system prompt
    const systemPrompt = [ // Setting up the system prompt
    {
      role: 'system',
      content: `You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable.`,
    },
    ]

    if (chatState === 'asking') {
      console.log('asking on the route.ts')
      
      // set up the system prompt
      const systemPrompt = [ // Setting up the system prompt
        {
          role: 'system',
          content: `You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable.`,
        },
      ]

      const response = await openai.chat.completions.create( // Actually sending the request to OpenAI
        {
          model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
          stream: true, // streaming YAY
          messages: [{ role: "system", content: "You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable"}], // really easy to put messages into practice using this. The ...messages is all previous messages, which can be problematic if there are too many messages (hits max token limit)
        }
      );
      
      const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
      return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse

    } else if (chatState === 'waiting') {
      console.log('waiting')
      const systemPrompt = [ // Setting up the system prompt
      {
        role: 'system',
        content: `You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable.`,
      },
    ]
    } else if (chatState === 'grading') {
      console.log('waiting')
      const systemPrompt = [ // Setting up the system prompt
      {
        role: 'system',
        content: `You are an AI assistant who writes short haikus on flowers. Format responses using markdown where applicable.`,
      },
    ]
    }
    
    let docContext = '';
    if (useRag) {
      const {data} = await openai.embeddings.create({input: latestMessage, model: 'text-embedding-ada-002'}); // only use the latest message for the embedding for the vector db search

      const collection = await astraDb.collection(`chat_${similarityMetric}`); // Just connecting to the collection of chat_{similarityMetric} In Astra DB. Basically choosing your table

      const cursor= collection.find(null, { // null is a query filter here -- we don't actually query for RAG, we use the below sorting and limiting of number of returns
        sort: {
          $vector: data[0]?.embedding, // $vector is for vector search, the data[0] is the first row, and .embedding is the embedding column, so it says to use the embedding column in a longer wording
        },
        limit: 5, // Limit to 5 results, should only get things that are relevant
      });
      
      const documents = await cursor.toArray(); // cast the things I get from my cursor to an Array type.
      
      docContext = `
        START CONTEXT
        ${documents?.map(doc => doc.content).join("\n") /*Extracts each row in the array's "content" variable*/}
        END CONTEXT
      `
    }
    const ragPrompt = [ // Setting up the system prompt
      {
        role: 'system',
        content: `You are an AI assistant answering questions about Cassandra and Astra DB. Format responses using markdown where applicable.
        ${docContext} 
        If the answer is not provided in the context, the AI assistant will say, "I'm sorry, I don't know the answer".
      `,
      },
    ]

    const response = await openai.chat.completions.create( // Actually sending the request to OpenAI
      {
        model: llm ?? 'gpt-3.5-turbo', // defaults to gpt-3.5-turbo if llm is not provided
        stream: true, // streaming YAY
        messages: [...systemPrompt, ...messages], // really easy to put messages into practice using this. The ...messages is all previous messages, which can be problematic if there are too many messages (hits max token limit)
      }
    );
    const stream = OpenAIStream(response); // sets up the stream - using the OpenAIStream function from the ai.ts file
    return new StreamingTextResponse(stream); // returns the stream as a StreamingTextResponse
  } catch (e) { // error handling
    throw e;
  }
}
