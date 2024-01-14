"use client";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { TutoringSessionsProvider } from "./contexts/TutoringSessionContext";
import ChildEditCardContent from "./ChildEditCardContent";
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
  return (
    <TutoringSessionsProvider>
      <ChildEditCardContent
        studentId={studentId}
        childStudentData={childStudentData}
        router={router}
      />
    </TutoringSessionsProvider>
  );
};

export default ChildEditCard;
