"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FirestoreExtendedUser,
  FirestoreStudent,
  TutoringSession,
} from "@/app/utils/interfaces";
import ChildEditCard from "./components/ChildEditCard";
import ChildEditCardShadcn from "./components/ChildEditCardShadcn";
import {
  getUserFromDb,
  getStudentFromDB,
} from "@/app/utils/databaseFunctionsFirestore";
import { TutoringSessionsProvider } from "./contexts/TutoringSessionContext";
import { useTutoringSessions } from "./contexts/TutoringSessionContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [childUserData, setChildUserData] =
    useState<FirestoreExtendedUser>(null);
  const [childStudentData, setChildStudentData] =
    useState<FirestoreStudent>(null);
  const { setChildTutoringSession } = useTutoringSessions();

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
          const userData = await getUserFromDb(id);
          const studentData = await getStudentFromDB(id);
          console.log("Child Tutoring Sessions");
          setChildUserData(userData);
          setChildStudentData(studentData);
        };
        if (!childUserData) {
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
    <TutoringSessionsProvider>
      <main>
        <div className="w-full">
          <div className="flex flex-col w-full items-center justify-start">
            {childUserData ? (
              <ChildEditCardShadcn
                studentId={id}
                childUserData={childUserData}
                childStudentData={childStudentData}
                router={router}
              />
            ) : null}
          </div>
          <p className="mt-4 flex items-center justify-between md:mt-8"></p>
        </div>
      </main>
    </TutoringSessionsProvider>
  );
}
