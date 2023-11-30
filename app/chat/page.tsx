"use client";
import {useEffect, useRef, useState, useCallback} from 'react';
import Bubble from '../../components/Bubble'
import { useChat } from 'ai/react';
import Footer from '../../components/Footer';
// import ThemeButton from '../components/ThemeButton';
import useConfiguration from '../hooks/useConfiguration';
import React, { FormEvent } from 'react';
import ProgressBar from '../../components/ProgressBar';
import { useSearchParams } from 'next/navigation';


// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Andrew: every time new message comes in the progress bar is updated to reflect if the answer was correct or not
const getRelevantChangeIndicator = (messages) => {
  // Implement logic to determine if a relevant change has occurred
  // For example, return the length of the messages array or a timestamp of the last relevant message
  // console.log('Messages length: ' + messages.length)
  return messages.length;
};


export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat(); // imported from the ai/react package, which can be found here: https://www.npmjs.com/package/ai
  const relevantChangeIndicator = getRelevantChangeIndicator(messages);
  const messagesEndRef = useRef(null);
  
  // same as below but in question asking mode
  const [myChatState, setMyChatState] = useState('asking');

  // retrieve the studentSkill from the server
  // this is populated then fed into the chat call to determine chat behvaiour
  const [studentSkill, setStudentSkill] = useState({
    id: '',
    email_address: '',
    subject: '',
    skill: '',
    mastery_score: 0,
    retention_score: 0,
    need_to_revise: false,
    decay_value: 0.5,
  });

  // getting the search params from the url
  // Andrew: creates a dictionary mapping parameters to their unique id
  const searchParams = useSearchParams();
  const _id = searchParams.get('_id');
  // console.log('The _id is: ' + _id)
  // console.log('The type of id is: ' + typeof(_id));

  const fetchStudentSkill = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch('/api/getStudentSkill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setStudentSkill(data);
    } catch (error) {
      console.error('Error fetching student skill:', error);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Use useEffect to call the fetch function when the component mounts
  useEffect(() => {
    fetchStudentSkill();
  }, []); // Empty dependency array to run only once on mount

  // Andrew: new message starts, check if need to update mastery metric and so if need to.
  useEffect(() => {
    // console.log('New message received, fetching student skill again')
    fetchStudentSkill();
    // console.log(studentSkill)
  }, [relevantChangeIndicator]); // when messages increases in length (a new message) we call 

  const handleDependencies = (dependencyCheck) => {
  
    if (dependencyCheck.areDependenciesValid) {
      // console.log('Dependencies are valid');
    } else {
      // console.log('Dependencies are not valid');
      var message = `Warning, before you continue, you aren't yet proficient enough in the following dependencies::\n`;
      for (var i = 0; i < dependencyCheck.invalidDependencies.length; i++) {
        message += `${dependencyCheck.invalidDependencies[i]}\nWe recommend you practice these skills more before continuing`;
      }
      alert(message);
    }
  };

  const checkDependencies = useCallback(async () => {
    // Ensure both email and skill are defined and not empty before making the call
    if (!studentSkill.email_address || !studentSkill.skill) {
      console.log('Skipping dependency check - email or skill is undefined or empty');
      return;
    }
  
    try {
      // console.log('Fetching dependencies');
      const response = await fetch('/api/checkDependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: studentSkill.email_address, skill: studentSkill.skill })
      });
      const data = await response.json();
      handleDependencies(data);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    }
  }, [studentSkill.email_address, studentSkill.skill]); // Update dependencies
  
  const debouncedCheckDependencies = useCallback(debounce(checkDependencies, 500), [checkDependencies]);
  
  useEffect(() => {
    debouncedCheckDependencies();
  }, [debouncedCheckDependencies]);  // Dependency is the debounced function itself

  const handleSend = (e) => {
    // console.log(chatState); messages, llm, chatState, skill, email
    handleSubmit(e, {
       options: {
         body: {
           llm: 'gpt-4', chatState: myChatState, email: studentSkill.email_address, skill: studentSkill.skill // Andrew: no messages here
          }
        }
      });
    // console.log('Chatbot is waiting for a response now');

    if (myChatState === 'asking') {
      // console.log('Changing to waiting');
      // setConfiguration(useRag, llm, similarityMetric, 'waiting', skill, email);
      setMyChatState('waiting');
    } else if (myChatState === 'waiting') {
      // console.log('Changing to asking');
      // setConfiguration(useRag, llm, similarityMetric, 'asking', skill, email);
      setMyChatState('asking');
    } 
  }

  return (
    <>
    <main className="flex h-screen flex-col items-center justify-center">
      <section className='chatbot-section flex flex-col origin:w-[800px] w-full origin:h-[735px] h-full rounded-md p-2 md:p-6'>
        <div className='chatbot-header pb-6'>
          <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
              <h1 className='chatbot-text-primary text-xl md:text-2xl font-medium' style={{ marginBottom: '15px' }}>{studentSkill.skill}</h1>
            </div>
          </div>
          <div className = 'flex justify-between'>
            <div className='flex items-center gap-2'>
              <ProgressBar score={studentSkill.mastery_score} width="200px" backgroundColor="#388a91" />
            </div>
          </div>
          <p className="chatbot-text-secondary-inverse text-sm md:text-base mt-2 md:mt-4">When you are ready, say that you&apos;re ready, and you will be asked a question. Provide an answer, and you will receive some feedback on your answer. After you&apos;ve read your feedback, say you&apos;re ready for the next question to go again and increase your mastery!</p>
        </div>
        <div className='flex-1 relative overflow-y-auto my-4 md:my-6'>
          <div className='absolute w-full overflow-x-hidden'>
            {messages.map((message, index) => <Bubble ref={messagesEndRef} key={`message-${index}`} content={message} />)}
          </div>
        </div>
        <form className='flex h-[40px] gap-2' onSubmit={handleSend}>
          <input onChange={handleInputChange} value={input} className='chatbot-input flex-1 text-sm md:text-base outline-none bg-transparent rounded-md p-2' placeholder='Send a message...' />
          <button type="submit" className='chatbot-send-button flex rounded-md items-center justify-center px-2.5 origin:px-3' style= {{ backgroundColor: '#388a91'}}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M2.925 5.025L9.18333 7.70833L2.91667 6.875L2.925 5.025ZM9.175 12.2917L2.91667 14.975V13.125L9.175 12.2917ZM1.25833 2.5L1.25 8.33333L13.75 10L1.25 11.6667L1.25833 17.5L18.75 10L1.25833 2.5Z" />
            </svg>
            <span className='hidden origin:block font-semibold text-sm ml-2'>Send</span>
          </button>
        </form>
        <Footer />
      </section>
    </main>
    </>
  )
}