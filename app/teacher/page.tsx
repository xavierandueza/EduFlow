"use client";
import { useState, useEffect } from "react";
import { ClassCard } from "../ui/teacher/cards";
import { SchoolClass, FirestoreTeacher } from "../utils/interfaces";
import { Firestore } from "firebase-admin/firestore";

export default function Page() {
  const [teacher, setTeacher] = useState<FirestoreTeacher>(
    {} as FirestoreTeacher,
  );

  const email = "clara@everdawn.ai";

  const fetchTeacher = async () => {
    try {
      const response = await fetch("/api/getTeacherFirestore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      // console.log('Successfully retrieved the student skill')
      // console.log(studentSkill)
      setTeacher(data);
      console.log(data.schoolClasses);
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Classes</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {teacher.schoolClasses &&
          teacher.schoolClasses.map((schoolClass, index) => (
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
