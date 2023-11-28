'use client';
import DisplayAggregateSkillsTable from '../../../ui/teacher/skill-aggregate-table';
// import DisplayAggregateStudentsTable from '../../ui/teacher/student-aggregate-table';
import { SkillAggregate, StudentAggregate } from '../../../utils/interfaces';
import { useState, useEffect } from 'react';
// import { PrepForClassCard } from '../../ui/teacher/cards';
import Search from '../../../ui/search';
import { CreateLessonPlan } from '../../../ui/teacher/buttons';
 
export default function Page() {
  const [skillAggregates, setSkillAggregates] = useState<SkillAggregate[]>([]);
  const [studentAggregates, setStudentAggregates] = useState<StudentAggregate[]>([]);
  // Where you call the API to fetch data. First will be aggregate of class skills
  
  useEffect(() => {
    // Retrieve data from session storage
    const sessionSkillAggregates = sessionStorage.getItem('skillAggregates');
    const sessionStudentAggregates = sessionStorage.getItem('studentAggregates');
    if (sessionSkillAggregates) {
      setSkillAggregates(JSON.parse(sessionSkillAggregates));
    }
    if (sessionStudentAggregates) {
      setStudentAggregates(JSON.parse(sessionStudentAggregates));
    }
  }, []);
 
  return (
    <main>
      <h1 className={"mb-4 text-xl md:text-2xl"}>
        {skillAggregates[0] ? `Class: ${skillAggregates[0].school_class_name}` : ''}
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <CreateLessonPlan />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <DisplayAggregateSkillsTable skillAggregates={skillAggregates} />
      </div>
    </main>
  );
}