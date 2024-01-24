"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FirestoreStudentSkill } from "@/app/utils/interfaces";
import { Progress } from "@/components/ui/progress";
import CheckOrWarn from "./components/CheckOrWarn";
import Link from "next/link";
import { info } from "console";

// used to define the shape of the data, could also use zod
export const columns: ColumnDef<FirestoreStudentSkill>[] = [
  {
    accessorKey: "skill",
    header: () => (
      <div className="font-semibold text-black text-">Skill Name</div>
    ),
    cell: (info) => (
      <>
        <Link
          href={`/skills/${info.row.original.id}`}
          className="font hover:text-light-teal"
        >
          {info.getValue() as string}
        </Link>
      </>
    ),
  },
  {
    accessorKey: "masteryScore",
    header: () => <div className="font-semibold text-black">Mastery Score</div>,
    cell: (info) => (
      <Progress
        value={Number(info.getValue())}
        className="md:w-full lg:w-2/3 bg-slate-200"
        indicatorColor="bg-dark-teal"
      />
    ),
  },
  {
    accessorKey: "retentionScore",
    header: () => (
      <div className="font-semibold text-black">Retention Score</div>
    ),
    cell: (info) => (
      <Progress
        value={Number(info.getValue())}
        className="md:w-full lg:w-2/3 bg-slate-200"
        indicatorColor="bg-dark-teal"
      />
    ),
  },
  {
    accessorKey: "areDependenciesMet",
    header: () => (
      <div className="text-center font-semibold text-black">
        Dependencies Met
      </div>
    ),
    cell: (info) => <CheckOrWarn status={Boolean(info.getValue())} />,
  },
  {
    accessorKey: "needToRevise",
    header: () => (
      <div className="text-center font-semibold text-black">Need to Revise</div>
    ),
    cell: (info) => (
      <CheckOrWarn status={Boolean(info.getValue())} revision={true} />
    ),
  },
];
