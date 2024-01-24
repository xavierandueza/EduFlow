import Nav from "@/app/dashboard/components/Nav";
import { FirestoreStudentSkill } from "../utils/interfaces";
import { columns } from "./components/columns";
import { SkillsTable } from "./components/SkillsTable";
import { getStudentSkillFromDb } from "../utils/databaseFunctionsFirestore";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { RevisionTable } from "./components/RevisionTable";

const fetchStudentSkills = async ({
  studentId,
}: {
  studentId: string;
}): Promise<FirestoreStudentSkill[]> => {
  const studentSkills = await getStudentSkillFromDb({
    studentId: studentId,
  });
  // console.log(studentSkills);
  return studentSkills;
};

const Page = async () => {
  // Declaring constants
  // const { data: session, status } = useSession();
  // used for swapping between the accounts of children - default of 0 for first child (most people only have 1)
  const session = await getServerSession(authOptions);

  const studentSkills = await fetchStudentSkills({
    studentId: session?.user?.id,
  });

  // Get the revision skills, the filtered where needToRevise is true
  const revisionSkills = studentSkills.filter(
    (skill) => skill.needToRevise === true
  );

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
          Skills table goes here
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
          <SkillsTable columns={columns} data={studentSkills} />
          <RevisionTable columns={columns} data={revisionSkills} />
        </main>
      </div>
    );
  } else {
    return null;
  }
};

export default Page;
