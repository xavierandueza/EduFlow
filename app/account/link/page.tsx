"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FirestoreStudent } from "@/app/utils/interfaces";
import { getStudentFromDb } from "@/app/utils/databaseFunctionsFirestore";
import { useSearchParams } from "next/navigation";
import Nav from "@/app/dashboard/components/Nav";
import AcceptLinkForm from "./components/AcceptLinkForm";

const Page = () => {
  // Declaring constants
  const router = useRouter();
  const { data: session, status } = useSession();
  // used for swapping between the accounts of children - default of 0 for first child (most people only have 1)
  const [studentData, setStudentData] = useState<FirestoreStudent>(null);
  const searchParams = useSearchParams();
  const linkingId = searchParams.get("id");
  console.log(linkingId);

  useEffect(() => {
    // Gets the relevant data from the database
    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      console.log("unauthenticated");
      router.push(process.env.NEXT_PUBLIC_SIGNIN_PAGE); // Need to log in before accessing this page
    } else if (status === "authenticated" && !session?.user?.role) {
      console.log("authenticated");
      router.push(process.env.NEXT_PUBLIC_SIGNUP_PAGE);
    } else {
      if (session?.user?.role == "student") {
        // If student, we need to load the student data
        const fetchData = async () => {
          const data = await getStudentFromDb({
            id: session?.user?.id,
            role: session?.user?.role,
          });

          setStudentData(data);
        };

        if (!studentData) {
          fetchData();
        }
      } else if (session?.user?.role == "teacher") {
        router.push("/teacher");
      } else if (session?.user?.role == "parent") {
        // logic for this later.
      }
    }
  }, [status, session, router]);

  if (searchParams) {
    return (
      <div className="flex flex-col h-screen max-w-[1800px] w-full mx-auto">
        <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
          <Nav session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 mx-auto">
          <AcceptLinkForm
            id={session?.user?.id}
            role={session?.user?.role}
            linkToUserId={linkingId}
            router={router}
          />
        </main>
      </div>
    );
  } else {
    <p>No linking id</p>;
  }
};

export default Page;
