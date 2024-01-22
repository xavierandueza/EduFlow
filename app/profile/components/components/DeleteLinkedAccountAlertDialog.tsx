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
import { unlinkAccounts } from "@/app/utils/databaseFunctionsFirestore";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const DeleteLinkedAccountAlertDialog = ({
  parentId,
  childId,
  role,
  router,
}: {
  parentId: string;
  childId: string;
  role: string;
  router: AppRouterInstance;
}) => {
  const { toast } = useToast();
  console.log("Parent ID on comp load is: " + parentId);
  console.log("Child ID on comp load is: " + childId);

  const handleUnlink = async () => {
    // unlink the accounts, can only be done from a parent so logic is easier
    console.log("parent id of: " + parentId);
    console.log("child id of: " + childId);
    const unlinked = await unlinkAccounts({
      parentId: parentId,
      childId: childId,
    });

    if (unlinked) {
      toast({
        title: "Successfully unlinked accounts",
        description: "Please refresh the page to see the changes.",
        action: (
          <ToastAction altText="Refresh" onClick={router.refresh}>
            Refresh
          </ToastAction>
        ),
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error: Unable to unlink accounts",
        description: "Please try again later.",
      });
    }
  };

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
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else if (role === "parent") {
    return (
      <AlertDialog>
        <AlertDialogTrigger>
          <Button className="hover:bg-red-500" variant="secondary" size="icon">
            <Link2Off className="w-5 h-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Unlinking</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you would like to unlink this account? In order to
            re-link, you will need to go through the linking process again.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              className="hover:bg-red-500"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
};

export default DeleteLinkedAccountAlertDialog;
