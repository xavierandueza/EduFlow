import React, { useRef, useState, useEffect, useCallback } from 'react';
import Bubble from '../../../components/Bubble';
import FooterTeacher from '../../../components/FooterTeacher';
import { useChat } from 'ai/react';
import { ExtendedSkillAggregate } from '../../utils/interfaces';

export default function Chatbot({
    sessionSkillAggregates
}: {
    sessionSkillAggregates : ExtendedSkillAggregate[];
}) {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const messagesEndRef = useRef(null);

  const includedSkills = sessionSkillAggregates.filter(skill => skill.include_in_class_lesson_plan);

  const handleSend = (e) => {
    // Implement the logic to handle sending a message
    handleSubmit(e, 
        { options: 
            { body: 
                { llm: 'gpt-4', 
                myChatAction: 'creatingLessonPlan', 
                email: '', 
                skill: '',
                sessionSkillAggregates: sessionSkillAggregates
                }
            }
        });
  };

  return (
    <section className='chatbot-section flex flex-col origin:w-[800px] w-full origin:h-[735px] h-full rounded-md p-2 md:p-6'>
        <div className='chatbot-header pb-6'>
            <div className='flex justify-between'>
                <div className='flex items-center gap-2'>
                    <h2 className='mb-4 text-xl md:text-2xl' style={{ marginBottom: '15px' }}>
                    {includedSkills.length > 0 ? `Skills Included in Lesson Plan: ${includedSkills.map(skill => skill.skill).join(', ')}` : 'No Skills Selected'}
                    </h2>
                </div>
            </div>
            <p className="chatbot-text-secondary-inverse text-sm md:text-base mt-2 md:mt-4">After selecting the skills you want to teach in this lesson, ask to generate the lesson plan, and from there feel free to ask any follow up questions.</p>
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
        <FooterTeacher />
    </section>
  );
}
