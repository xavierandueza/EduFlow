"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TutoringSession } from "@/app/utils/interfaces";
import TutoringSessionForm from "./components/TutoringSessionForm";
import { PlusIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const EditTutoringSession = ({
  studentId,
  existingTutoringSessionId,
  existingTutoringSession,
}: {
  studentId: string;
  existingTutoringSessionId?: string;
  existingTutoringSession?: TutoringSession;
}) => {
  console.log("studentId on EditTutoringSession.tsx file is: " + studentId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "hover:bg-light-teal px-2 ",
            existingTutoringSession ? "" : "bg-slate-200"
          )}
        >
          {existingTutoringSession ? (
            <PencilSquareIcon className="h-5 w-5" />
          ) : (
            <PlusIcon className="h-5 w-5" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingTutoringSession
              ? "Edit Tutoring Session"
              : "Create New Tutoring Session"}
          </DialogTitle>
          <DialogDescription>
            {existingTutoringSession
              ? "Enter the new values for your tutoring session."
              : "Enter the values for your new tutoring session."}
          </DialogDescription>
        </DialogHeader>
        <TutoringSessionForm
          studentId={studentId}
          existingTutoringSessionId={existingTutoringSessionId}
          existingTutoringSession={existingTutoringSession}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTutoringSession;
