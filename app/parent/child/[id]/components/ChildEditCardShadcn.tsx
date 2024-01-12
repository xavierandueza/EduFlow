"use client";
import { useState, useEffect } from "react";
import {
  FirestoreExtendedUser,
  FirestoreStudent,
  TutoringSession,
} from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import ChildTutoringTime from "./components/ChildTutoringTime";
import { Button } from "@/components/ui/button";
import { useTutoringSessions } from "../contexts/TutoringSessionContext";
import { getTutoringSessionFromDb } from "@/app/utils/databaseFunctionsFirestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCardShadcn = ({
  studentId,
  childUserData,
  childStudentData,
  router,
}: {
  studentId: string;
  childUserData: FirestoreExtendedUser;
  childStudentData: FirestoreStudent;
  router: AppRouterInstance;
}) => {
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();
  // Get a variable for student full name
  const [studentName, setStudentName] = useState<string>(
    `${childUserData.firstName} ${childUserData.lastName}`
  );

  const renderSubscribeButton = () => {
    if (childUserData.subscriptionActive) {
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

    if (childUserData && !childTutoringSession.length) {
      fetchData();
    }
  }, [studentId]);

  useEffect(() => {
    setStudentName(`${childUserData.firstName} ${childUserData.lastName}`);
  }, [childUserData]);

  return (
    <Card className="w-[600px] m-6 shadow-lg">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex flex-row justify-start items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={childUserData?.image}
                  alt={`${studentName}'s profile`}
                />
                <AvatarFallback className="h-16 w-16">
                  {childUserData.firstName[0].toUpperCase()}{" "}
                  {childUserData.lastName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start items-start ml-4">
                <h1 className="text-2xl font-semibold line-clamp-2">
                  {studentName}
                </h1>
                <p className="text-gray-600 line-clamp-1 text-xl">
                  {childUserData.subscriptionActive
                    ? camelCaseToNormalTextCapitalized(
                        childUserData.subscriptionName
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

export default ChildEditCardShadcn;
