'use client';
import { DisplayAggregateSkillsTableWithSelection } from '../../../ui/teacher/skill-aggregate-table';
// import DisplayAggregateStudentsTable from '../../ui/teacher/student-aggregate-table';
import { SkillAggregate, StudentAggregate, ExtendedSkillAggregate } from '../../../utils/interfaces';
import { useState, useEffect } from 'react';
// import { PrepForClassCard } from '../../ui/teacher/cards';
import { CreateLessonPlan } from '../../../ui/teacher/buttons';
// import Bubble from '../../../../components/Bubble';
import { useChat } from 'ai/react';
// import Footer from '../../../../components/Footer';
// import ThemeButton from '../components/ThemeButton';
import React, { FormEvent } from 'react';
import Chatbot from '../../../ui/teacher/chatbot';
// import Chatbot from '../../../ui/teacher/chatbot';


 
export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [skillAggregates, setSkillAggregates] = useState<ExtendedSkillAggregate[]>([]);
  const [studentAggregates, setStudentAggregates] = useState<StudentAggregate[]>([]);
  const [myChatState, setMyChatState] = useState('creating_lesson_plan'); // chatState is used for the route.ts file
  // Where you call the API to fetch data. First will be aggregate of class skills
  
  useEffect(() => {
    // Retrieve data from session storage
    const sessionSkillAggregates = sessionStorage.getItem('skillAggregates');
    const sessionStudentAggregates = sessionStorage.getItem('studentAggregates');
    if (sessionSkillAggregates) {
      const parsedSkillAggregates: SkillAggregate[] = JSON.parse(sessionSkillAggregates);
      const extendedSkillAggregates: ExtendedSkillAggregate[] = parsedSkillAggregates.map(skill => ({
        ...skill,
        include_in_class_lesson_plan: false
      }));
      setSkillAggregates(extendedSkillAggregates);
    }
    if (sessionStudentAggregates) {
      setStudentAggregates(JSON.parse(sessionStudentAggregates));
    }
  }, []);

  const toggleIncludeInClassLessonPlan = (skillName: string) => {
    setSkillAggregates(currentAggregates =>
      currentAggregates.map(agg =>
        agg.skill === skillName
          ? { ...agg, include_in_class_lesson_plan: !agg.include_in_class_lesson_plan }
          : agg
      )
    );
  };

  const handleSend = (e) => {
    // console.log(chatState); messages, llm, chatState, skill, email
    handleSubmit(e, { options: { body: { llm: 'gpt-4', myChatState: myChatState, email: '', skill: ''}}});
    // console.log('Chatbot is waiting for a response now');

    /* Handling different chat states below, not needed at present 
    if (myChatState === 'creating_lesson_plan') {
      // console.log('Changing to waiting');
      // setConfiguration(useRag, llm, similarityMetric, 'waiting', skill, email);
      setMyChatState('waiting');
    } else if (myChatState === 'waiting') {
      // console.log('Changing to asking');
      // setConfiguration(useRag, llm, similarityMetric, 'asking', skill, email);
      setMyChatState('asking');
    } 
    */
  }
 
  return (
    <main>
      <h1 className={"mb-4 text-xl md:text-2xl"}>
        {skillAggregates[0] ? `Class: ${skillAggregates[0].school_class_name}` : ''}
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <  
          extendedSkillAggregates={skillAggregates}
          onToggle={toggleIncludeInClassLessonPlan} />
        <Chatbot sessionSkillAggregates={skillAggregates}/>
      </div>
    </main>
  );
}