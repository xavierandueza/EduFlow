'use client';
import { DisplayAggregateSkillsTableWithSelection } from '../../../ui/teacher/skill-aggregate-table';
import { SkillAggregate, StudentAggregate, ExtendedSkillAggregate } from '../../../utils/interfaces';
import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import React, { FormEvent } from 'react';
import Chatbot from '../../../ui/teacher/chatbot';
import { ChatAction } from '../../../utils/interfaces';


 
export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [skillAggregates, setSkillAggregates] = useState<ExtendedSkillAggregate[]>([]);
  const [studentAggregates, setStudentAggregates] = useState<StudentAggregate[]>([]);
  const [chatAction, setChatAction] = useState<ChatAction>('creatingLessonPlan'); // chatState is used for the route.ts file
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
 
  return (
    <main>
      <h1 className={"mb-4 text-xl md:text-2xl"}>
        {skillAggregates[0] ? `Class: ${skillAggregates[0].school_class_name}` : ''}
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <DisplayAggregateSkillsTableWithSelection 
          extendedSkillAggregates={skillAggregates}
          onToggle={toggleIncludeInClassLessonPlan} />
        <Chatbot sessionSkillAggregates={skillAggregates}/>
      </div>
    </main>
  );
}