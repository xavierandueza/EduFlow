"use client";
/* Should have a dialog that pops up. 
Needs to have two options, I have a link, I want to send my link.
I have a link should allow them to input a link, which will then try to connect to the corresponding account.
I want to send my link will generate the link for them to send, have a button to copy to clipboard, and 
also an email button. 
There should be some sort of acceptance required here, so I'll have to think about how to integrate that
*/
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
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, Copy, Mail } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  getUserFromDb,
  getParentFromDb,
} from "@/app/utils/databaseFunctionsFirestore";
import { linkUsersInDb } from "@/app/utils/databaseFunctionsFirestore";
import { useToast } from "@/components/ui/use-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToastAction } from "@/components/ui/toast";

const formSchema = z.object({
  accountLink: z.string().min(1, "Required"),
});

const LinkAccountDialog = ({
  id,
  role,
  router,
}: {
  id: string;
  role: string;
  router: AppRouterInstance;
}) => {
  const [linkOption, setLinkOption] = useState<string>(null);
  const [isValidAccount, setIsValidAccount] = useState<boolean>(false);
  const [accountCheckMessage, setAccountCheckMessage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // form for submitting the link
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const resetStates = () => {
    setLinkOption(null);
    setIsValidAccount(false);
    setAccountCheckMessage(null);
    setLoading(false);
  };

  const handleLinkRequest = async (values: z.infer<typeof formSchema>) => {
    // handles the submission of a link request
    let linkToUserId: string;
    if (!values.accountLink) {
      console.error("No account link inputted");
      toast({
        variant: "destructive",
        title: "Error: No Account Link Inputted",
        description: "Please input an account link.",
      });
      return;
    } else {
      // remove any whitespaces from the link
      linkToUserId = values.accountLink.replace(/\s/g, "");
    }

    const linkingSuccess = await linkUsersInDb({
      userId: id,
      linkToUserId: linkToUserId,
      role: role,
    });

    if (linkingSuccess) {
      // success
      console.log("Successfully linked users");
      toast({
        title: "Successfully requested accounts to be linked",
        description:
          "The other user will need to accept you on their end to finalise linking. Refresh the page to see the changes.",
        action: (
          <ToastAction altText="Refresh" onClick={router.refresh}>
            Refresh
          </ToastAction>
        ),
      });
    } else {
      // failure
      console.error("Failed to link users");
      toast({
        variant: "destructive",
        title: "Error: Failed Linking Users",
        description: "There was an error linking users, please try again.",
      });
    }
  };

  const checkAccountLink = async () => {
    // begin loading and checking data
    setLoading(true);

    // set local link
    let link = form.getValues("accountLink");

    // check if the link is valid
    if (!link || link?.length === 0) {
      // not correct, so set isValidAccount as false
      console.log("No valid link input");
      setIsValidAccount(false);
      setAccountCheckMessage("Please enter a valid link");
    } else {
      // reset the message when loading is going on
      setAccountCheckMessage(null);
    }

    // remove any whitespaces from the link
    link = link.replace(/\s/g, "");

    // check if the link is valid by trying to pull in the account
    if (role === "student") {
      // Check if a user exists within the database
      const user = await getUserFromDb({ id: link });
      console.log("user is");
      console.log(user);

      if (id === link) {
        console.error("Cannot link to yourself");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "You cannot link to yourself. Please double-check the account link has been inputted correctly."
        );
      } else if (!user) {
        console.error("No user found");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "No user found for the account. Please double-check the account link has been inputted correctly."
        );
      } else if (user.role !== "parent") {
        console.error("User account found, but no parent account found");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "An account was found, however it is not a parent account. This could be because the account has not finished setup, or the account is not a parent account. Please double-check the account link has been inputted correctly."
        );
      } else {
        // got through checks just fine, now set the details
        setIsValidAccount(true);
        setAccountCheckMessage(
          `Account for ${user.firstName} ${user.lastName} found! Please click submit to link the account.`
        );
      }
    } else if (role === "parent") {
      // Check if a user exists within the database
      const user = await getUserFromDb({ id: link });

      if (id === link) {
        console.error("Cannot link to yourself");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "You cannot link to yourself. Please double-check the account link has been inputted correctly."
        );
      } else if (!user) {
        console.error("No user found");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "No user found for the account. Please double-check the account link has been inputted correctly."
        );
      } else if (user.role !== "student") {
        console.error("User account found, but not a student account");
        setIsValidAccount(false);
        setAccountCheckMessage(
          "An account was found, however it is not a student account. This could be because the account has not finished setup, or the account is not a parent account. Please double-check the account link has been inputted correctly."
        );
      } else {
        // got through checks just fine, now set the details
        setIsValidAccount(true);
        setAccountCheckMessage(
          `Account for ${user.firstName} ${user.lastName} found! Please click submit to link the account.`
        );
      }
    }

    // done with everything, so now just set loading to false
    setLoading(false);
  };

  // function to copy to clipboard
  // This function will be responsible for copying the text
  const copyToClipboard = async (text) => {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopyClick = async () => {
    const textToCopy = "www.edu-flow.com.au/account/link?id=" + id;
    try {
      await copyToClipboard(textToCopy);
      // You can set some state to show a confirmation message if needed
      console.log("Text copied to clipboard"); // Or handle the visual feedback
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  useEffect(() => {
    console.log(linkOption);
  }, [linkOption]);

  if (!id) {
    return <></>;
  } else {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="hover:bg-light-teal"
            variant="secondary"
            onClick={resetStates}
          >
            <UserPlus className="w-4 h-4 mr-1 font-light" />
            <p className="font-semibold">Link</p>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Link Account Request</DialogTitle>
            <DialogDescription>
              {role === "student"
                ? "Do you have a link, or would you like to generate a link to send to a parent/guardian?"
                : "Do you have a link, or would you like to generate a link to send to your child?"}
            </DialogDescription>
          </DialogHeader>
          {/* Need to have a radio or something similar that, depending on the value, will fill out the rest of the dialog */}
          <div>
            <RadioGroup onValueChange={setLinkOption}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="haveLink" id="haveLink" />
                <Label htmlFor="haveLink">I have a link</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generateLink" id="generateLink" />
                <Label htmlFor="generateLink">
                  I want to generate and send a link
                </Label>
              </div>
            </RadioGroup>
            {linkOption === "haveLink" && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    handleLinkRequest(data)
                  )}
                  className="mt-4"
                >
                  <FormField
                    control={form.control}
                    name="accountLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Input Account Link
                        </FormLabel>
                        <FormDescription>
                          Please enter the account link.
                        </FormDescription>
                        <div className="flex flex-row justify-between">
                          <FormControl>
                            <Input
                              placeholder="Account link here..."
                              {...field}
                            />
                          </FormControl>
                          <Button
                            className="hover:bg-light-teal ml-2"
                            type="button"
                            onClick={checkAccountLink}
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex flex-row items-center">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <p className="ml-2">Checking</p>
                              </div>
                            ) : (
                              "Check"
                            )}
                          </Button>
                        </div>
                        {accountCheckMessage && (
                          <p
                            className={`text-sm font-semibold ${
                              isValidAccount
                                ? "text-light-teal"
                                : "text-red-500"
                            }`}
                          >
                            {accountCheckMessage}
                          </p>
                        )}
                      </FormItem>
                    )}
                  ></FormField>
                  {isValidAccount && (
                    <DialogClose asChild>
                      <Button
                        type="submit"
                        className="hover-bg-light-teal mt-4"
                      >
                        Submit
                      </Button>
                    </DialogClose>
                  )}
                </form>
              </Form>
            )}
            {linkOption === "generateLink" && (
              <div className="flex flex-col space-y-4 mt-4">
                <div className="flex flex-row">
                  <Input
                    className="flex"
                    readOnly
                    type="text"
                    value={"www.edu-flow.com.au/account/link?id=" + id}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="hover:bg-light-teal ml-1.5"
                    onClick={() => handleCopyClick()}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="hover:bg-light-teal"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};

export default LinkAccountDialog;
