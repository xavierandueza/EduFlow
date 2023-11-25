"use client";
import {useEffect, useRef, useState, useCallback} from 'react';
import Bubble from '../components/Bubble'
import { useChat } from 'ai/react';
import Footer from '../components/Footer';
import Configure from '../components/Configure';
import ThemeButton from '../components/ThemeButton';
import useConfiguration from './hooks/useConfiguration';
import React, { FormEvent } from 'react';
import ProgressBar from '../components/ProgressBar';

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

const getRelevantChangeIndicator = (messages) => {
  // Implement logic to determine if a relevant change has occurred
  // For example, return the length of the messages array or a timestamp of the last relevant message
  console.log('Messages length: ' + messages.length)
  return messages.length;
};

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat(); // imported from the ai/react package, which can be found here: https://www.npmjs.com/package/ai
  const { useRag, llm, similarityMetric, chatState, skill, email, setConfiguration } = useConfiguration(); // custom useConfiguration hook, good code but only defines how you set config variables, not how you use them
  const relevantChangeIndicator = getRelevantChangeIndicator(messages);
  const messagesEndRef = useRef(null);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [displaySkill, setDisplaySkill] = useState(skill);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [masteryScore, setMasteryScore] = useState(null);

  // Async function to fetch the mastery score
  const fetchMasteryScore = async () => {
    try {
      console.log('About to try and fetch mastery score')
      const response = await fetch('/api/getMasteryScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, skill })
      }); // Assuming retrieveMetricScore is your function to fetch the score
      const score = await response.json(); // Adjust this line based on how your data is returned
      console.log('Successfully retrieved the mastery score');
      console.log(`Mastery score is: ${score.masteryScore}`);
      setMasteryScore(score.masteryScore);
    } catch (error) {
      console.error('Error fetching mastery score:', error);
    }
  };

  // Use useEffect to call the fetch function when the component mounts
  useEffect(() => {
    setConfiguration(useRag, llm, similarityMetric, 'asking', skill, email);
    fetchMasteryScore();
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    if (chatState === 'asking') { // only fetch if we are waiting for a response and it came in
      console.log('Waiting and messages increased by 1 so lets increase score')
      fetchMasteryScore();
    }
  }, [relevantChangeIndicator]); // when messages increases in length (a new message) we call 

  useEffect(() => {
    console.log('chatState is: ' + chatState);
  }, [chatState]);

  const handleDependencies = (dependencyCheck) => {
    /*
    console.log(`Dependencies retrieved: 
    ${dependencyCheck.skill}
    ${dependencyCheck.dependencies}
    ${dependencyCheck.email}`);
    */
  
    if (dependencyCheck.areDependenciesValid) {
      // console.log('Dependencies are valid');
    } else {
      // console.log('Dependencies are not valid');
      var message = 'Warning, before you continue, the following dependencies are not valid:\n';
      for (var i = 0; i < dependencyCheck.invalidDependencies.length; i++) {
        message += `${dependencyCheck.invalidDependencies[i]} SCORE: ${dependencyCheck.invalidDependenciesScores[i]}\n`;
      }
      alert(message);
    }
  };

  const checkDependencies = useCallback(async () => {
    try {
      // console.log('About to try and fetch dependencies');
      const response = await fetch('/api/checkDependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, skill })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the data');
      handleDependencies(data);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    }
  }, [skill]); // Dependencies for useCallback

  const debouncedCheckDependencies = useCallback(debounce(checkDependencies, 500), [checkDependencies]);

  useEffect(() => {
    // Call the debounced version inside useEffect
    debouncedCheckDependencies();
  }, [debouncedCheckDependencies]); // Dependency is the debounced function itself
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Skill changed to: ' + skill + ' fetching mastery score');
    fetchMasteryScore();
    setDisplaySkill(skill);
  }, [skill]);

  const handleSend = (e) => {
    // console.log(chatState);
    handleSubmit(e, { options: { body: { useRag, llm, similarityMetric, chatState, skill, email}}});
    // console.log('Chatbot is waiting for a response now');

    if (chatState === 'asking') {
      console.log('Changing to waiting');
      setConfiguration(useRag, llm, similarityMetric, 'waiting', skill, email);
    } else if (chatState === 'waiting') {
      console.log('Changing to asking');
      setConfiguration(useRag, llm, similarityMetric, 'asking', skill, email);
    } /*else if (chatState === 'grading') {
      console.log('Changing to asking');
      setConfiguration(useRag, llm, similarityMetric, 'asking');
    }
    */
  }

  return (
    <>
    <main className="flex h-screen flex-col items-center justify-center">
      <section className='chatbot-section flex flex-col origin:w-[800px] w-full origin:h-[735px] h-full rounded-md p-2 md:p-6'>
        <div className='chatbot-header pb-6'>
          <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
              <h1 className='chatbot-text-primary text-xl md:text-2xl font-medium' style={{ marginBottom: '15px' }}>{displaySkill}</h1>
            </div>
            <div className='flex gap-1'>
              <button onClick={() => setConfigureOpen(true)}>
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.14 13.4006C19.18 13.1006 19.2 12.7906 19.2 12.4606C19.2 12.1406 19.18 11.8206 19.13 11.5206L21.16 9.94057C21.34 9.80057 21.39 9.53057 21.28 9.33057L19.36 6.01057C19.24 5.79057 18.99 5.72057 18.77 5.79057L16.38 6.75057C15.88 6.37057 15.35 6.05057 14.76 5.81057L14.4 3.27057C14.36 3.03057 14.16 2.86057 13.92 2.86057H10.08C9.83999 2.86057 9.64999 3.03057 9.60999 3.27057L9.24999 5.81057C8.65999 6.05057 8.11999 6.38057 7.62999 6.75057L5.23999 5.79057C5.01999 5.71057 4.76999 5.79057 4.64999 6.01057L2.73999 9.33057C2.61999 9.54057 2.65999 9.80057 2.85999 9.94057L4.88999 11.5206C4.83999 11.8206 4.79999 12.1506 4.79999 12.4606C4.79999 12.7706 4.81999 13.1006 4.86999 13.4006L2.83999 14.9806C2.65999 15.1206 2.60999 15.3906 2.71999 15.5906L4.63999 18.9106C4.75999 19.1306 5.00999 19.2006 5.22999 19.1306L7.61999 18.1706C8.11999 18.5506 8.64999 18.8706 9.23999 19.1106L9.59999 21.6506C9.64999 21.8906 9.83999 22.0606 10.08 22.0606H13.92C14.16 22.0606 14.36 21.8906 14.39 21.6506L14.75 19.1106C15.34 18.8706 15.88 18.5506 16.37 18.1706L18.76 19.1306C18.98 19.2106 19.23 19.1306 19.35 18.9106L21.27 15.5906C21.39 15.3706 21.34 15.1206 21.15 14.9806L19.14 13.4006ZM12 16.0606C10.02 16.0606 8.39999 14.4406 8.39999 12.4606C8.39999 10.4806 10.02 8.86057 12 8.86057C13.98 8.86057 15.6 10.4806 15.6 12.4606C15.6 14.4406 13.98 16.0606 12 16.0606Z" />
                </svg>
              </button>
            </div>
          </div>
          <div className = 'flex justify-between'>
            <div className='flex items-center gap-2'>
              <ProgressBar score={masteryScore} width="200px" backgroundColor="#388a91" />
            </div>
          </div>
          <p className="chatbot-text-secondary-inverse text-sm md:text-base mt-2 md:mt-4">When you are ready, say that you're ready, and you will be asked a question. Provide an answer, and you will receive some feedback on your answer. After you've read your feedback, say you're ready for the next question to go again and increase your mastery!</p>
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
    <Configure
      isOpen={configureOpen}
      onClose={() => setConfigureOpen(false)}
      useRag={useRag}
      llm={llm}
      similarityMetric={similarityMetric}
      chatState={chatState}
      skill={skill}
      email={email}
      setConfiguration={setConfiguration}
    />
    </>
  )
}