import '@testing-library/jest-dom'
import setStudentChatState from '../../pages/api/setStudentChatState'

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

describe('Testing setStudentChatState API', () => {    
    let req, res, json, status;

    // Need to do some fucky shit with our res here, since it's actually a JSON response
    beforeEach(() => {
        req = {
            body: JSON.stringify({
                studentResponse: 'test',
                lastAction: 'test'
            })
        }
    
        json = jest.fn();
    
        status = jest.fn(() => {
            return {
                json
            }
        })
    
        res = {
            status
        }
    
    })

    // check that the function exists
    it('should exist', () => {
        expect(setStudentChatState).toBeDefined();
    })

    
    // check that the function returns a response:
    it('should return a response', async () => {
        const response = await setStudentChatState(req, res);
        console.log(json.mock.calls[0][0])
        expect(json.mock.calls[0][0]).toBeDefined(); // if you want to get anything from the return
    })
})