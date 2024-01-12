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
  DialogClose,
} from "@/components/ui/dialog";
import { TrashIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/use-toast";
import { deleteTutoringSession } from "@/app/utils/databaseFunctionsFirestore";
import { useTutoringSessions } from "../../../contexts/TutoringSessionContext";

const DeleteTutoringSession = ({
  studentId,
  existingTutoringSessionId,
}: {
  studentId: string;
  existingTutoringSessionId: string;
}) => {
  const { toast } = useToast();
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();

  const index = childTutoringSession.findIndex((session) =>
    session.hasOwnProperty(existingTutoringSessionId)
  );

  const DeleteTutoringSession = async () => {
    try {
      deleteTutoringSession({ studentId, existingTutoringSessionId }).then(
        (myBool) => {
          if (myBool) {
            // remove from the childTutoringSession context
            const updatedSessions = childTutoringSession.filter(
              (session) => !session.hasOwnProperty(existingTutoringSessionId)
            );

            // Delete the session context
            setChildTutoringSession(updatedSessions);

            toast({
              title: "Tutoring Session Deleted",
              description: "Your tutoring session has been deleted.",
              duration: 3000,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error Deleting Tutoring Session",
              description:
                "An error has occurred when deleting your tutoring session. Please try again later.",
              duration: 3000,
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error Deleting Tutoring Session",
        description:
          "An error has occurred when deleting your tutoring session. Please try again later.",
        duration: 3000,
      });
    }
  };

  console.log();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "hover:bg-red-400 px-2 ",
            existingTutoringSessionId ? "" : "bg-slate-200"
          )}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete tutoring session</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your tutoring session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="default" className="">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="hover:bg-red-400"
              onClick={() => DeleteTutoringSession()}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTutoringSession;
