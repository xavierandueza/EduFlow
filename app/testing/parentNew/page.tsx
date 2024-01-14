"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { ResponsiveLine } from "@nivo/line";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getStudentDataFromParents } from "@/app/_actions";
import { FirestoreParentChildLong } from "@/app/utils/interfaces";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
import { PlusIcon } from "@heroicons/react/24/outline";
import ChildEditCard from "./components/ChildEditCard";

const Page = () => {
  // Declaring constants
  const router = useRouter();
  const { data: session, status } = useSession();
  const [parentChildData, setParentChildData] = useState<{
    [id: string]: FirestoreParentChildLong;
  }>(null);
  // used for swapping between the accounts of children - default of 0 for first child (most people only have 1)
  const [childIndex, setChildIndex] = useState<number>(0);
  const [childId, setChildId] = useState<string>();

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
          // want to order by the student Id
          // order by the alphabetical order of the keys
          const orderedKeys = Object.keys(data).sort();

          if (orderedKeys.length === 0) {
            // leave as null
          } else {
            // create a new object with the ordered keys
            let orderedData = {};
            for (const key of orderedKeys) {
              orderedData[key] = data[key];
            }

            setParentChildData(orderedData);
          }
        };
        if (!parentChildData) {
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

  // set the student name and the student Id
  useEffect(() => {
    parentChildData
      ? setChildId(Object.keys(parentChildData)[childIndex])
      : null;
  }, [childIndex, parentChildData]);

  return (
    <div key="1" className="flex flex-col h-screen max-w-[1800px]">
      <header className="flex h-16 items-center px-4 border-b shrink-0 md:px-6">
        <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Button variant="ghost" className="p-0">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  "https://lh3.googleusercontent.com/a/ACg8ocIuzKCL5p4HMLr8UONbwbY7PV0o1QFxOs2gQnATCy5KHw=s96-c"
                }
                alt={"Placeholder avatar"}
              />
              <AvatarFallback className="h-16 w-16 flex item-center">
                {"x".toUpperCase()}
                {"a".toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          <Link className="font-bold" href="#">
            Dashboard
          </Link>
          <Link className="text-gray-500 dark:text-gray-400" href="#">
            Subscription
          </Link>
          <Link className="text-gray-500 dark:text-gray-400" href="#">
            Settings
          </Link>
        </nav>
        <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="flex-1 ml-auto sm:flex-initial">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                placeholder="Search..."
                type="search"
              />
            </div>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Child's Name
              </CardTitle>
              <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parentChildData && childId
                  ? `${parentChildData[childId].firstName} 
                ${parentChildData[childId].lastName}`
                  : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Subscription Plan
              </CardTitle>
              <PackageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parentChildData && childId
                  ? parentChildData[childId].subscriptionActive
                    ? camelCaseToNormalTextCapitalized(
                        parentChildData[childId].subscriptionName
                      )
                    : "Unsubscribed"
                  : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Usage</CardTitle>
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 hours</div>
              <Progress className="mt-2 h-4" value={50} />
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-bold">
                Upcoming Tutoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parentChildData && childId ? (
                <ChildEditCard
                  studentId={childId}
                  childStudentData={parentChildData[childId]}
                  router={router}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-bold">
                Time Spent Graph
              </CardTitle>
              <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <LineChart className="aspect-[9/4]" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-bold">
                Recent Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Skill</TableHead>
                    <TableHead className="text-right">Mastery</TableHead>
                    <TableHead>Date Practiced</TableHead>
                    <TableHead className="text-right">
                      Additional Information
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Addition</TableCell>
                    <TableCell className="text-right">
                      <div className="w-24 h-2 rounded bg-green-500" />
                    </TableCell>
                    <TableCell>2022-01-13</TableCell>
                    <TableCell className="text-right">
                      Practiced 10 times
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subtraction</TableCell>
                    <TableCell className="text-right">
                      <div className="w-24 h-2 rounded bg-yellow-500" />
                    </TableCell>
                    <TableCell>2022-01-12</TableCell>
                    <TableCell className="text-right">
                      Practiced 5 times
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Multiplication
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="w-24 h-2 rounded bg-yellow-500" />
                    </TableCell>
                    <TableCell>2022-01-11</TableCell>
                    <TableCell className="text-right">
                      Practiced 7 times
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Division</TableCell>
                    <TableCell className="text-right">
                      <div className="w-24 h-2 rounded bg-red-500" />
                    </TableCell>
                    <TableCell>2022-01-10</TableCell>
                    <TableCell className="text-right">
                      Practiced 3 times
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fractions</TableCell>
                    <TableCell className="text-right">
                      <div className="w-24 h-2 rounded bg-red-500" />
                    </TableCell>
                    <TableCell>2022-01-09</TableCell>
                    <TableCell className="text-right">
                      Practiced 2 times
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="flex h-16 items-center px-4 shrink-0 md:px-6">
        <div className="flex-1" />
        <Button className="w-full md:w-auto" variant="outline">
          Manage Subscription
        </Button>
      </footer>
    </div>
  );
};

function BarChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LineChart(props) {
  return (
    <div {...props}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "Jan", y: 43 },
              { x: "Feb", y: 137 },
              { x: "Mar", y: 61 },
              { x: "Apr", y: 145 },
              { x: "May", y: 26 },
              { x: "Jun", y: 154 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "Jan", y: 60 },
              { x: "Feb", y: 48 },
              { x: "Mar", y: 177 },
              { x: "Apr", y: 78 },
              { x: "May", y: 96 },
              { x: "Jun", y: 204 },
            ],
          },
        ]}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={["#2563eb", "#e11d48"]}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        role="application"
      />
    </div>
  );
}

function Package2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default Page;
