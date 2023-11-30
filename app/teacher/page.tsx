'use client';
import { useState, useEffect } from 'react';
import { ClassCard } from '../ui/teacher/cards'; 
import { getTeacherFromDB, getSchoolClassFromDBAll } from '../utils/databaseFunctions';
import { SchoolClass } from '../utils/interfaces';
 
export default function Page() {
  const [schoolClassList, setSchoolClassList] = useState<SchoolClass[]>([]); // [SchoolClass

  const email_address = "clara@everdawn.ai";

  /*
  const teacher = await getTeacherFromDB("clara@everdawn.ai");
  console.log(teacher);

  const schoolClassList = await getSchoolClassFromDBAll(teacher.school_classes);
  */

  const fetchSchoolClassList = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch('/api/getSchoolClassList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_address })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setSchoolClassList(data);
    } catch (error) {
      console.error('Error fetching student skill:', error);
    }
  }

  useEffect(() => {
    fetchSchoolClassList();
  }, []);
 
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">
        Classes
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {schoolClassList.map((schoolClass, index) => (
          <ClassCard key={index} schoolClass={schoolClass} />
        ))}
      </div>
      <div className="flex-grow mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <p>Placeholder for a calendar </p>
        <p>Placeholder for a notification section </p>
      </div>
    </main>
  );
}