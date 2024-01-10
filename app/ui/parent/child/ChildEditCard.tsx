"use client";
import { useState, useEffect } from "react";
import {
  FirestoreExtendedUser,
  FirestoreStudent,
  TutoringSession,
} from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import ChildTutoringTime from "@/app/ui/parent/child/ChildTutoringTime";
import Link from "next/link";
// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCard = ({
  studentId,
  childUserData,
  childStudentData,
  childTutoringSession,
  router,
}: {
  studentId: string;
  childUserData: FirestoreExtendedUser;
  childStudentData: FirestoreStudent;
  childTutoringSession: { [id: string]: TutoringSession }[];
  router: AppRouterInstance;
}) => {
  // Get a variable for student full name
  const [studentName, setStudentName] = useState<string>(
    `${childUserData.firstName} ${childUserData.lastName}`
  );

  const renderSubscribeButton = () => {
    if (childUserData.subscriptionActive) {
      return (
        <button
          className="bg-slate-100 hover:bg-slate-200 text-black no-flex px-2 py-2 rounded-md capitalize font-bold mt-1"
          onClick={() => router.push(`/subscription/${studentId}`)}
        >
          Manage Subscription
        </button>
      );
    } else {
      return (
        <button
          className="bg-slate-100 hover:bg-slate-200 text-black no-flex px-2 py-2 rounded-md capitalize font-bold mt-1"
          onClick={() => router.push(`/subscription?studentId=${studentId}`)}
        >
          Subscribe
        </button>
      );
    }
  };

  useEffect(() => {
    setStudentName(`${childUserData.firstName} ${childUserData.lastName}`);
    console.log("childUserData");
    console.log(childUserData);
  }, [childUserData]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-6 w-full md:w-144 xl:w-192">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img
            src={childUserData?.image}
            alt={`${studentName}'s profile`}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-semibold line-clamp-2">
              {studentName}
            </h2>
            <p className="text-gray-600 line-clamp-1">
              {childUserData.subscriptionActive
                ? childUserData.subscriptionName
                : "No active subscription"}
            </p>
          </div>
        </div>
        {renderSubscribeButton()}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tutoring Timeslot:
          </label>
          <div className="mt-1 bg-gray-200 p-2 rounded">
            <ChildTutoringTime childTutoringSession={childTutoringSession} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weekly Time Remaining:
          </label>
          <div className="mt-1 bg-gray-200 p-2 rounded">
            {/* Placeholder for weekly time */}
            []
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Last Worked: DATETIME
        </label>
        <div className="mt-1 bg-gray-200 p-2 rounded">
          {/* Placeholder for last worked datetime */}
          []
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">Recent Skills:</h3>
        {/*<SummarySkillTable />*/}
      </div>
    </div>
  );
};

export default ChildEditCard;
