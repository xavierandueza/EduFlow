"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeleteLinkedAccountAlertDialog = ({ role }: { role: string }) => {
  // an alert dialog that will pop up when the user wants to delete a linked account
  if (role === "student") {
    return (
      <AlertDialog>
        <AlertDialogTrigger>
          <Button className="hover:bg-red-500" variant="secondary" size="icon">
            <Link2Off className="w-5 h-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unable to unlink from student account
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Unfortunately, you are unable to unlink from a student account.
            Please ask your parent/guardian to unlink you from their account.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
};

export default DeleteLinkedAccountAlertDialog;
