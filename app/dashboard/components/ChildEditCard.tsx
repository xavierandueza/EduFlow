"use client";
import { LinkedUser } from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { TutoringSessionsProvider } from "./contexts/TutoringSessionContext";
import ChildEditCardContent from "./ChildEditCardContent";
// import SummarySkillTable from './SummarySkillTable'; // Import your SummarySkillTable component

const ChildEditCard = ({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) => {
  return (
    <TutoringSessionsProvider>
      <ChildEditCardContent studentId={studentId} studentName={studentName} />
    </TutoringSessionsProvider>
  );
};

export default ChildEditCard;
