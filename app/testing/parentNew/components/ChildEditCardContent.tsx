"use client";
import { useState, useEffect } from "react";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import ChildTutoringTime from "./components/ChildTutoringTime";
import { Button } from "@/components/ui/button";
import { useTutoringSessions } from "./contexts/TutoringSessionContext";
import { getTutoringSessionFromDb } from "@/app/utils/databaseFunctionsFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
import { useToast } from "@/components/ui/use-toast";
import ChildTutoringSession from "./components/ChildTutoringSession";

// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCardContent = ({
  studentId,
  childStudentData,
  router,
}: {
  studentId: string;
  childStudentData: FirestoreParentChildLong;
  router: AppRouterInstance;
}) => {
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();
  // Get a variable for student full name
  const [studentName, setStudentName] = useState<string>(
    `${childStudentData.firstName} ${childStudentData.lastName}`
  );
  const { toast } = useToast();
  const renderSubscribeButton = () => {
    if (childStudentData.subscriptionActive) {
      return (
        <Button
          variant="default"
          className="hover:bg-light-teal"
          onClick={() => router.push(`/subscription/${studentId}`)}
        >
          Manage Subscription
        </Button>
      );
    } else {
      return (
        <Button
          variant="default"
          className="hover:bg-light-teal"
          onClick={() => router.push(`/subscription/${studentId}`)}
        >
          Subscribe
        </Button>
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const myChildTutoringSession = await getTutoringSessionFromDb(studentId);
      setChildTutoringSession(myChildTutoringSession);
    };

    if (childStudentData && !childTutoringSession.length) {
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

  useEffect(() => {
    setStudentName(
      `${childStudentData.firstName} ${childStudentData.lastName}`
    );
  }, [childStudentData]);

  return (
    <>
      <div>
        <ChildTutoringSession studentId={studentId} />
      </div>
    </>
  );
};

export default ChildEditCardContent;
