"use client";
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
import { Button } from "@/components/ui/button";
import { acceptLinkRequest } from "@/app/utils/databaseFunctionsFirestore";

const ManageLinkRequestDialog = ({
  role,
  childId,
  childFirstName,
  childLastName,
  childAcceptedRequest,
  parentId,
  parentFirstName,
  parentLastName,
  parentAcceptedRequest,
}: {
  role: string;
  childId: string;
  childFirstName: string;
  childLastName: string;
  childAcceptedRequest: boolean;
  parentAcceptedRequest: boolean;
  parentId: string;
  parentFirstName: string;
  parentLastName: string;
}) => {
  const handleAcceptClick = () => {
    console.log("accepting link request");
    acceptLinkRequest({ childId: childId, parentId: parentId });
  };

  // an alert dialog that will pop up when the user wants to delete a linked account
  if (
    (role === "student" && childAcceptedRequest) ||
    (role === "parent" && parentAcceptedRequest)
  ) {
    return null;
  } else {
    return (
      <Dialog>
        <DialogTrigger>
          <Button className="hover:bg-light-teal" variant="default">
            Manage Request
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept or Reject Request</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {`You have received a request from ${
              childAcceptedRequest ? childFirstName : parentFirstName
            } ${
              childAcceptedRequest ? childLastName : parentLastName
            } to link accounts. Would you like to accept or reject this request?`}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" className="hover:bg-red-500">
                Reject
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="default"
                className="hover:bg-light-teal"
                onClick={handleAcceptClick}
              >
                Accept
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
};

export default ManageLinkRequestDialog;
