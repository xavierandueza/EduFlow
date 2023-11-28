'use client';
import DisplayAggregateSkillsTable from '../../ui/teacher/skill-aggregate-table';
import DisplayAggregateStudentsTable from '../../ui/teacher/student-aggregate-table';
import { SkillAggregate, StudentAggregate } from '../../utils/interfaces';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
 
export default function Page() {
  const [skillAggregates, setSkillAggregates] = useState<SkillAggregate[]>([]);
  const [studentAggregates, setStudentAggregates] = useState<StudentAggregate[]>([]);
  // Where you call the API to fetch data. First will be aggregate of class skills
  // Fixed to begin with
  const aggregatedSkills = {
    "skill" : "Skill1",
    "mastery_score" : 30,
    "retention_score" : 15,
    "no_students_not_met_dependencies" : 5,
    "no_students_to_revise" : 10,
  } as SkillAggregate
  // const latestInvoices = await fetchLatestInvoices();

  const searchParams = useSearchParams();
  const _id = searchParams.get('_id'); // the ID for the class. Lets you fetch class-name, and then the skills for the class
  
  const fetchSkillAggregates = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch('/api/getSkillAggregates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setSkillAggregates(data);
    } catch (error) {
      console.error('Error fetching student skill:', error);
    }
  }

  const fetchStudentAggregates = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch('/api/getStudentAggregates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setStudentAggregates(data);
    } catch (error) {
      console.error('Error fetching student skill:', error);
    }
  }

  useEffect(() => {
    fetchSkillAggregates();
    fetchStudentAggregates();
  }, []);

  // const skillsAggregate = await getSkillsAggregateForClassFromDB(_id);
  /* Probably irrelevant for this page, cards will likely just dissappear
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  */
 
  return (
    <main>
      <h1 className={"mb-4 text-xl md:text-2xl"}>
        Dashboard
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <DisplayAggregateSkillsTable skillAggregates={skillAggregates} />
        <DisplayAggregateStudentsTable studentAggregates={studentAggregates} /*Replace with students view after*//>
      </div>
    </main>
  );
}