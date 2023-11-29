import React, { useEffect, useState } from 'react';

    function index() {

        const [message,setMessage] = useState("Loading");
        const [people, setPeople] = useState([]);

        useEffect(() =>{
            fetch('http://localhost:8080/api/chat/fakeroute').then(
                response => response.json()
            ).then((data) => {
                // message = 'Loading'
                // once data is retrieved, messsage is set to data.message
                setMessage(data.message);
                setPeople(data.people);
                console.log(data.people)
            });
        }, [])

        return <div>{message}</div>;
    }
export default index;


/**
 * A stream wrapper to send custom JSON-encoded data back to the client.
 */
declare class experimental_StreamData {
    private encoder;
    private controller;
    stream: TransformStream<Uint8Array, Uint8Array>;
    private isClosedPromise;
    private isClosedPromiseResolver;
    private isClosed;
    private data;
    constructor();
    close(): Promise<void>;
    append(value: JSONValue): void;
}
/**
 * A TransformStream for LLMs that do not have their own transform stream handlers managing encoding (e.g. OpenAIStream has one for function call handling).
 * This assumes every chunk is a 'text' chunk.
 */
declare function createStreamDataTransformer(experimental_streamData: boolean | undefined): TransformStream<any, any>;

/**
 * A utility class for streaming text responses.
 */
declare class StreamingTextResponse extends Response {
    constructor(res: ReadableStream, init?: ResponseInit, data?: experimental_StreamData);
}