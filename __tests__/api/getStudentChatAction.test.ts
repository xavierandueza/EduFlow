import "@testing-library/jest-dom";
import "openai/shims/node";
import setStudentChatState from "../../pages/api/getStudentChatAction";
import {
  StudentResponseRequestBody,
  ChatAction,
} from "../../app/utils/interfaces";

// Not recommended to get to know jest and testing, but useful for testing API

/* Syntax for jest testing

Describe is used to actually describe the test suite
describe('Description of what you are trying to achieve here', () => {
    const myVar = 1; // Just setup whatever vars you might need
    
    beforeEach(() => {
        // Do something before each test
        // Automatically runs this piece of code before each it block
    })

    afterEach(() => {
        // Do something after each test
        // Automatically runs this piece of code after each it block
    })

    // it is used for an individual behaviour, phrase as a sentence
    it('should do this exact thing', () => {
        const result = getMyResultFunc(myVar); // whatever you want to test

        // You expect the result to be equal to something. Lots of different to__ methods
        expect(result).toBe(1); 
    })
    
})
*/

describe("Testing setStudentChatState API", () => {
  let req: StudentResponseRequestBody, res, json, status;

  // Creating a request body via func call
  function createRequest(
    relevantChatMessage: string,
    studentResponse: string,
    lastAction: ChatAction,
  ): StudentResponseRequestBody {
    return {
      body: {
        relevantChatMessage,
        studentResponse,
        lastAction,
      },
    } as StudentResponseRequestBody;
  }

  // Need to do some fucky shit with our res here, since it's actually a JSON response
  beforeEach(() => {
    // setting up the response
    json = jest.fn();

    status = jest.fn(() => {
      return {
        json,
      };
    });

    res = {
      status,
    };
  });

  it("should exist", () => {
    expect(setStudentChatState).toBeDefined();
  });

  it("should return a response", async () => {
    req = createRequest(
      "This is the chat message",
      "Ready",
      "gradingValidAnswer",
    );
    const response = await setStudentChatState(req, res);
    // console.log(json.mock.calls[0][0]) // if you want to get anything from the return of an API
    expect(json.mock.calls[0][0]).toBeDefined();
  });

  it("should return a response that is of type ChatState", async () => {
    req = createRequest(
      "This is the chat message",
      "Ready",
      "gradingValidAnswer",
    );

    // unfortunately have to manually input the valid ChatActions:
    const validChatActions = [
      "clarifyingQuestion",
      "gradingValidAnswer",
      "gradingInvalidAnswer",
      "providingExtraFeedback",
      "askingQuestion",
      "unknownResponse",
    ];

    const response = await setStudentChatState(req, res);
    // console.log(json.mock.calls[0][0]) // if you want to get anything from the return of an API
    expect(validChatActions).toContain(json.mock.calls[0][0].currentChatAction);
  });

  // setup the most basic examples:
  const basicTestCases = [
    // [relevantChatMessage, lastAction, studentResponse, expectedCurrentChatAction]
    [
      "What is 1+1 equal to?",
      "askingQuestion",
      "Do you want the answer as a number or as a word?",
      "clarifyingQuestion",
    ],
    [
      "What is 1+1 equal to?",
      "askingQuestion",
      "The answer is 2",
      "gradingValidAnswer",
    ],
    [
      "What is 1+1 equal to?",
      "askingQuestion",
      "I think that's a stupid question",
      "gradingInvalidAnswer",
    ],
    [
      "What is 1+1 equal to?",
      "clarifyingQuestion",
      "Do you want the answer as a number or as a word?",
      "clarifyingQuestion",
    ],
    [
      "What is 1+1 equal to?",
      "clarifyingQuestion",
      "The answer is 2",
      "gradingValidAnswer",
    ],
    [
      "What is 1+1 equal to?",
      "clarifyingQuestion",
      "I think that's a stupid question",
      "gradingInvalidAnswer",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "providingExtraFeedback",
      "Could you give me a more detailed explanation of the answer?",
      "providingExtraFeedback",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "providingExtraFeedback",
      "ready",
      "askingQuestion",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "providingExtraFeedback",
      "blah blah",
      "unknownResponse",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "unknownResponse",
      "Could you give me a more detailed explanation of the answer?",
      "providingExtraFeedback",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "unknownResponse",
      "ready",
      "askingQuestion",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "unknownResponse",
      "blah blah",
      "unknownResponse",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingValidAnswer",
      "Could you give me a more detailed explanation of the answer?",
      "providingExtraFeedback",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingValidAnswer",
      "ready",
      "askingQuestion",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingValidAnswer",
      "blah blah",
      "unknownResponse",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingInvalidAnswer",
      "Could you give me a more detailed explanation of the answer?",
      "providingExtraFeedback",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingInvalidAnswer",
      "ready",
      "askingQuestion",
    ],
    [
      "You got the question correct, 1+1 is equal to 2",
      "gradingInvalidAnswer",
      "blah blah",
      "unknownResponse",
    ],
  ];

  it.each(basicTestCases)(
    'With relevantChatMessage "%s" with lastAction "%s", studentResponse "%s" expecting currentChatAction to be: "%s"',
    async (a, b, c, expected) => {
      // console.log(`Relevant Chat message is: ${a}`);
      // console.log(`LastAction is: ${b}`);
      // console.log(`studentResponse is: ${c}`);
      // console.log(`expectedCurrentAction is: ${expected}`);

      req = createRequest(a, c, b as ChatAction);
      const response = await setStudentChatState(req, res);
      // console.log("Printing mock call");
      // console.log(json.mock.calls);
      expect(json.mock.calls[0][0].currentChatAction).toBe(
        expected as ChatAction,
      );
    },
  );

  // Create more extended testing routine here...
});
