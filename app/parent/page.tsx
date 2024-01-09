"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getStudentDataFromParents } from "@/app/_actions";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import ChildSummaryCard from "@/app/ui/parent/ChildSummaryCard";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parentStudentData, setParentStudentData] = useState<{
    [id: string]: FirestoreParentChildLong;
  }>(null);

  const renderChildSummaryCards = () => {
    return parentStudentData
      ? Object.entries(parentStudentData).map(([key, student]) => (
          <ChildSummaryCard
            key={key}
            studentId={key}
            studentData={student}
            router={router}
          />
        ))
      : null;
  };

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Need to log in before accessing this page
    } else if (status === "authenticated" && !session?.user?.role) {
      router.push("/account/signup");
    } else {
      if (session?.user?.role == "parent") {
        const fetchData = async () => {
          const data = await getStudentDataFromParents({
            parentId: session?.user?.id,
          });
          setParentStudentData(data);
        };
        if (!parentStudentData) {
          // only fetch if we don't have the data
          fetchData();
        }
      } else if (session?.user?.role == "student") {
        router.push("/student");
      } else if (session?.user?.role == "teacher") {
        router.push("/teacher");
      }
    }
  }, [status, session, router]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full items-center justify-start">
        {parentStudentData
          ? renderChildSummaryCards()
          : "No students to render"}
      </div>
      <p className="mt-4 flex items-center justify-between md:mt-8"></p>
    </div>
  );
}
