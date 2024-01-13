"use client";
import { useState, useEffect } from "react";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import ChildTutoringTime from "./components/ChildTutoringTime";
import { Button } from "@/components/ui/button";
import {
  TutoringSessionsProvider,
  useTutoringSessions,
} from "./contexts/TutoringSessionContext";
import { getTutoringSessionFromDb } from "@/app/utils/databaseFunctionsFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
import { useToast } from "@/components/ui/use-toast";
// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCard = ({
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
    <Card className="w-[600px] m-6 shadow-lg">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex flex-row justify-start items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={childStudentData?.image}
                  alt={`${studentName}'s profile`}
                />
                <AvatarFallback className="h-16 w-16">
                  {childStudentData.firstName[0].toUpperCase()}{" "}
                  {childStudentData.lastName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start items-start ml-4">
                <h1 className="text-2xl font-semibold line-clamp-2">
                  {studentName}
                </h1>
                <p className="text-gray-600 line-clamp-1 text-xl">
                  {childStudentData.subscriptionActive
                    ? camelCaseToNormalTextCapitalized(
                        childStudentData.subscriptionName
                      )
                    : "No active subscription"}
                </p>
              </div>
            </div>
            {renderSubscribeButton()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <label className="scroll-m-20 text-xl font-semibold tracking-tight">
              Tutoring Session(s)
            </label>
            <ChildTutoringTime studentId={studentId} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="scroll-m-20 text-xl font-semibold tracking-tight">
                Weekly Time Remaining
              </label>
              <div className="mt-1 bg-slate-200 p-2 rounded">35 minutes</div>
            </div>
            <div>
              <label className="scroll-m-20 text-xl font-semibold tracking-tight">
                Last Worked
              </label>
              <div className="mt-1 bg-slate-200 p-2 rounded">
                Monday 5th January
              </div>
            </div>
          </div>
          <div>
            <label className="scroll-m-20 text-xl font-semibold tracking-tight">
              Recent Skills
            </label>
            {/*<SummarySkillTable />*/}
            <div className="mt-1 bg-slate-200 p-2 rounded">
              Recent skills table here
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildEditCard;
