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
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const ContactLinkedAccountDialog = ({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}) => {
  // set the default message state
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSend = () => {
    // Toast notification about the message
    toast({
      title: "Message sent!",
      description: `Your message to ${firstName} ${lastName} has been sent.`,
      duration: 3000,
      variant: "default",
    });
    setMessage("");
  };

  // an alert dialog that will pop up when the user wants to delete a linked account
  if (email) {
    return (
      <Dialog>
        <DialogTrigger>
          <Button
            className="hover:bg-light-teal"
            variant="secondary"
            size="icon"
          >
            <MessageCircleMore className="w-[21px] h-[21px]" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Contact {firstName} {lastName}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Please type in your message to {firstName} {lastName}. They will
            receive an in-app notification.
          </DialogDescription>
          {/* Message below updates the state */}
          <Textarea
            value={message}
            placeholder="Your message here..."
            onChange={(e) => setMessage(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="default" onClick={() => handleSend()}>
                Send
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
};

export default ContactLinkedAccountDialog;
