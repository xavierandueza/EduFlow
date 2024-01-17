"use client";
import { useEffect } from "react";
import { useTutoringSessions } from "./contexts/TutoringSessionContext";
import { getTutoringSessionFromDb } from "@/app/utils/databaseFunctionsFirestore";
import { useToast } from "@/components/ui/use-toast";
import ChildTutoringSession from "./components/ChildTutoringSession";

// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCardContent = ({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) => {
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();
  // Get a variable for student full name
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const myChildTutoringSession = await getTutoringSessionFromDb(studentId);
      setChildTutoringSession(myChildTutoringSession);
    };

    if (studentId && !childTutoringSession.length) {
      try {
        fetchData();
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: `Error fetching ${studentName}'s tutoring sessions`,
          description: `There was an error getting the tutoring sessions for ${studentName}. Please refresh to try again.`,
          duration: 3000,
        });
      }
    }
  }, [studentId]);

  return (
    <>
      <div>
        <ChildTutoringSession studentId={studentId} />
      </div>
    </>
  );
};

export default ChildEditCardContent;
