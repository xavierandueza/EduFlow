"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getStudentDataFromParents } from "@/app/_actions";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import ChildEditCard from "./components/ChildEditCard";
import { useTutoringSessions } from "./components/contexts/TutoringSessionContext";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parentStudentData, setParentStudentData] = useState<{
    [id: string]: FirestoreParentChildLong;
  }>(null);
  const { setChildTutoringSession } = useTutoringSessions();

  const renderChildSummaryCards = () => {
    return;
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
          console.log("Parent Student Data");
          console.log(data);
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
          ? Object.entries(parentStudentData).map(([key, student]) => (
              <ChildEditCard
                key={key}
                studentId={key}
                childStudentData={student}
                router={router}
              />
            ))
          : null}
      </div>
      <p className="mt-4 flex items-center justify-between md:mt-8"></p>
    </div>
  );
}
