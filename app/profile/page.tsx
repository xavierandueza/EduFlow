"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getStudentDataFromParents } from "@/app/_actions";
import {
  FirestoreParentChildLong,
  FirestoreStudent,
} from "@/app/utils/interfaces";
import Nav from "@/app/dashboard/components/Nav";
import { getStudentFromDB } from "@/app/utils/databaseFunctionsFirestore";

const Page = () => {
  // Declaring constants
  const router = useRouter();
  const { data: session, status } = useSession();
  const [parentChildData, setParentChildData] = useState<{
    [id: string]: FirestoreParentChildLong;
  }>(null);
  // used for swapping between the accounts of children - default of 0 for first child (most people only have 1)
  const [childId, setChildId] = useState<string>();
  const [studentData, setStudentData] = useState<FirestoreStudent>(null);

  useEffect(() => {
    // Gets the relevant data from the database
    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      router.push(process.env.NEXT_PUBLIC_SIGNIN_PAGE); // Need to log in before accessing this page
    } else if (status === "authenticated" && !session?.user?.role) {
      router.push(process.env.NEXT_PUBLIC_SIGNUP_PAGE);
    } else {
      if (session?.user?.role == "parent") {
        const fetchData = async () => {
          const data = await getStudentDataFromParents({
            parentId: session?.user?.id,
          });

          if (Object.keys(data).length === 0) {
            // leave as null
          } else {
            setParentChildData(data);
          }
        };
        if (!parentChildData) {
          // only fetch if we don't have the data
          fetchData();
        }
      } else if (session?.user?.role == "student") {
        // If student, we need to load the student data
        const fetchData = async () => {
          const data = await getStudentFromDB(session?.user?.id);

          setStudentData(data);
        };

        if (!studentData) {
          fetchData();
        }
      } else if (session?.user?.role == "teacher") {
        router.push("/teacher");
      }
    }
  }, [status, session, router]);

  if (session?.user?.role === "parent") {
    return (
      <div
        key="1"
        className="flex flex-col h-screen max-w-[1800px] w-full mx-auto"
      >
        <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
          <Nav session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10"></main>
      </div>
    );
  } else {
    return (
      <div
        key="1"
        className="flex flex-col h-screen max-w-[1800px] w-full mx-auto"
      >
        <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
          <Nav session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10"></main>
      </div>
    );
  }
};

export default Page;
