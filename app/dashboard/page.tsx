"use client";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getStudentDataFromParents } from "@/app/_actions";
import {
  FirestoreParentChildLong,
  FirestoreStudent,
} from "@/app/utils/interfaces";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
import ChildEditCard from "./components/ChildEditCard";
import Nav from "./components/Nav";
import { getStudentFromDB } from "../utils/databaseFunctionsFirestore";
import {
  User,
  Package,
  Clock4,
  LineChart as LineChartIcon,
} from "lucide-react";

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
  const [studentData, setStudentData] = useState<FirestoreStudent>(null);

  useEffect(() => {
    // Gets the relevant data from the database
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

  // set the student name and the student Id
  useEffect(() => {
    if (session?.user?.role === "parent" && parentChildData) {
      setChildId(Object.keys(parentChildData)[childIndex]);
    }
  }, [childIndex, parentChildData]);

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Child's Name
                </CardTitle>
                <User className="w-6 h-5 text-gray-500 dark:text-gray-400" />
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
                <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
                <Clock4 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 hours</div>
                <Progress className="mt-2 h-4" value={50} />
              </CardContent>
            </Card>
          </div>
          <div>
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
                    studentName={`${parentChildData[childId].firstName} ${parentChildData[childId].lastName}`}
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
                <LineChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Name</CardTitle>
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session?.user &&
                    `${session?.user?.firstName} ${session?.user?.lastName}`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Subscription Plan
                </CardTitle>
                <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session?.user
                    ? session?.user?.subscriptionActive
                      ? camelCaseToNormalTextCapitalized(
                          session?.user?.subscriptionName
                        )
                      : "Unsubscribed"
                    : null}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Usage</CardTitle>
                <Clock4 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 hours</div>
                <Progress className="mt-2 h-4" value={50} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-2xl font-bold">
                  Upcoming Tutoring Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session?.user ? (
                  <ChildEditCard
                    studentId={session?.user?.id}
                    studentName={`${session?.user?.firstName} ${session?.user?.lastName}`}
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
                <LineChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
      </div>
    );
  }
};

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

export default Page;
