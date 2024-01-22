"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FirestoreStudent } from "@/app/utils/interfaces";
import Nav from "@/app/dashboard/components/Nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentFromDb } from "../utils/databaseFunctionsFirestore";
import LinkedAccountsCard from "./components/LinkedAccountsCard";
import ProfileDetailCards from "./components/ProfileDetailCards";
import ProfileDisplay from "./components/ProfileDisplay";

const Page = () => {
  // Declaring constants
  const router = useRouter();
  const { data: session, status, update } = useSession();
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

  if (session?.user?.role === "parent") {
    return (
      <div
        key="1"
        className="flex flex-col h-screen max-w-[1800px] w-full mx-auto"
      >
        <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
          <Nav session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <Tabs
            defaultValue="profile"
            className="max-w-[1500px] w-full mx-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="profile"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="subscription"
              >
                Subscription
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="notifications"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="flex flex-col space-y-8 mt-4">
                <ProfileDetailCards
                  firstName={session?.user?.firstName}
                  lastName={session?.user?.lastName}
                  subscriptionActive={session?.user?.subscriptionActive}
                  subscriptionName={session?.user?.subscriptionName}
                  role={session?.user?.role}
                />
                <LinkedAccountsCard
                  userId={session?.user?.id}
                  role={session?.user?.role}
                  firstName={session?.user?.firstName}
                  lastName={session?.user?.lastName}
                  router={router}
                />
                <ProfileDisplay
                  id={session?.user?.id}
                  role={session?.user?.role}
                  studentAccountInfo={studentData}
                  updateSession={update}
                />
              </div>
            </TabsContent>
            <TabsContent value="subscription">
              <p>Subscription</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p>Notifications</p>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  } else if (session?.user?.role === "student") {
    return (
      <div
        key="1"
        className="flex flex-col h-screen max-w-[1800px] w-full mx-auto"
      >
        <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
          <Nav session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          {/* Tabs for all of the different account options*/}
          <Tabs
            defaultValue="profile"
            className="max-w-[1500px] w-full mx-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="profile"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="subscription"
              >
                Subscription
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold hover:text-black"
                value="notifications"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="flex flex-col space-y-8 mt-4">
                <ProfileDetailCards
                  firstName={session?.user?.firstName}
                  lastName={session?.user?.lastName}
                  subscriptionActive={session?.user?.subscriptionActive}
                  subscriptionName={session?.user?.subscriptionName}
                  role={session?.user?.role}
                />
                <LinkedAccountsCard
                  userId={session?.user?.id}
                  role={session?.user?.role}
                  firstName={session?.user?.firstName}
                  lastName={session?.user?.lastName}
                  router={router}
                />
                <ProfileDisplay
                  id={session?.user?.id}
                  role={session?.user?.role}
                  studentAccountInfo={studentData}
                  updateSession={update}
                />
              </div>
            </TabsContent>
            <TabsContent value="subscription">
              <p>Subscription</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p>Notifications</p>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  } else {
    return null;
  }
};

export default Page;
