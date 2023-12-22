"use client";
import DisplayAggregateSkillsTable from "../../ui/teacher/skill-aggregate-table";
import DisplayAggregateStudentsTable from "../../ui/teacher/student-aggregate-table";
import { SkillAggregate, StudentAggregate } from "../../utils/interfaces";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { PrepForClassCard } from "../../ui/teacher/cards";
import Search from "../../ui/search";
import { CreateLessonPlan } from "../../ui/teacher/buttons";

export default function Page() {
  const [skillAggregates, setSkillAggregates] = useState<SkillAggregate[]>([]);
  const [studentAggregates, setStudentAggregates] = useState<
    StudentAggregate[]
  >([]);

  const searchParams = useSearchParams();
  const schoolClassId = searchParams.get("id"); // the ID for the class. Lets you fetch class-name, and then the skills for the class

  const fetchSkillAggregates = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch("/api/getSkillAggregatesFirestore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolClassId }),
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setSkillAggregates(data);
    } catch (error) {
      console.error("Error fetching student skill:", error);
    }
  };

  /*
  const fetchStudentAggregates = async () => {
    // console.log('entered fetching student skill function')
    try {
      const response = await fetch('/api/getStudentAggregates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schoolClassId })
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setStudentAggregates(data);
    } catch (error) {
      console.error('Error fetching student skill:', error);
    }
  }
  */

  useEffect(() => {
    fetchSkillAggregates();
    //fetchStudentAggregates();
  }, []);

  useEffect(() => {
    // Storing data in Session Storage
    sessionStorage.setItem("skillAggregates", JSON.stringify(skillAggregates));
    // sessionStorage.setItem('studentAggregates', JSON.stringify(studentAggregates));
  }, [skillAggregates, studentAggregates]);

  return (
    <main>
      <h1 className={"mb-4 text-xl md:text-2xl"}>
        Class:{" "}
        {skillAggregates[0]
          ? skillAggregates[0].school_class_name
          : "Loading..."}
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <CreateLessonPlan />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <DisplayAggregateSkillsTable skillAggregates={skillAggregates} />
        <DisplayAggregateStudentsTable
          studentAggregates={
            studentAggregates
          } /*Replace with students view after*/
        />
      </div>
    </main>
  );
}
