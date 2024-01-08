"use client";
import { useState, useEffect } from "react";
import { FirestoreParentChildLong } from "../../utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildSummaryCard = ({
  studentId,
  studentData,
  router,
}: {
  studentId: string;
  studentData: FirestoreParentChildLong;
  router: AppRouterInstance;
}) => {
  // Get a variable for student full name
  const [studentName, setStudentName] = useState<string>(
    `${studentData.firstName} ${studentData.lastName}`
  );

  const renderSubscribeButton = () => {
    if (studentData.subscriptionActive) {
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
    setStudentName(`${studentData.firstName} ${studentData.lastName}`);
  }, [studentData]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-6 w-full md:w-144 xl:w-192">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img
            src={studentData?.image}
            alt={`${studentName}'s profile`}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-semibold line-clamp-2">
              {studentName}
            </h2>
            <p className="text-gray-600 line-clamp-1">
              {studentData.subscriptionActive
                ? studentData.subscriptionName
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
            {/* Placeholder for timeslot */}
            []
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

export default ChildSummaryCard;
