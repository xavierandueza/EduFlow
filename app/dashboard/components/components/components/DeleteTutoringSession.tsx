"use client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { TrashIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/use-toast";
import { deleteTutoringSession } from "@/app/utils/databaseFunctionsFirestore";
import { useTutoringSessions } from "../../contexts/TutoringSessionContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Label } from "@/components/ui/label";

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
  const [mode, setMode] = useState<string>("single");

  const index = childTutoringSession.findIndex((session) =>
    session.hasOwnProperty(existingTutoringSessionId)
  );

  const DeleteTutoringSession = async (
    mode: string,
    repeatsFromOriginalSessionId
  ) => {
    console.log("mode: " + mode);
    try {
      deleteTutoringSession({
        studentId,
        existingTutoringSessionId,
        mode,
        repeatsFromOriginalSessionId,
      }).then((myBool) => {
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
      });
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "hover:bg-red-500 px-2 ",
            existingTutoringSessionId ? "" : "bg-slate-200"
          )}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete tutoring session</AlertDialogTitle>
          <AlertDialogDescription>
            {childTutoringSession[index][existingTutoringSessionId].repeats ? (
              <RadioGroup value={mode} onValueChange={setMode}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="r1" />
                  <Label htmlFor="r1">Only this session</Label>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="all" id="r2" />
                  <Label htmlFor="r2">
                    All recurring sessions at this time
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <></>
            )}
            Are you sure you want to delete your tutoring session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-start ">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" className="">
              Close
            </Button>
          </AlertDialogCancel>
          {/* Handle the repeating sessions */}
          {}
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="default"
              className="hover:bg-red-500"
              onClick={() =>
                DeleteTutoringSession(
                  mode,
                  childTutoringSession[index][existingTutoringSessionId]
                    .repeatsFromOriginalSessionId
                )
              }
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTutoringSession;
