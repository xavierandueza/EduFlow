"use client";
// Links accounts together from the sent link
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  linkUsersInDb,
  getUserFromDb,
} from "@/app/utils/databaseFunctionsFirestore";
import { Loader2 } from "lucide-react";

// form schema
const formSchema = z.object({
  accountLink: z.string().min(1, "Required"),
});

const AcceptLinkForm = ({
  id,
  role,
  linkToUserId,
  router,
}: {
  id: string;
  role: string;
  linkToUserId: string;
  router: AppRouterInstance;
}) => {
  const [isValidAccount, setIsValidAccount] = useState<boolean>(false);
  const [accountCheckMessage, setAccountCheckMessage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // form for submitting the link
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { setValue } = form;

  useEffect(() => {
    // set the value of the account link to the linkToUserId
    setValue("accountLink", linkToUserId);
  });

  const resetStates = () => {
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
    }

    // check if the link is valid by trying to pull in the account
    else if (role === "student") {
      // Check if a user exists within the database
      if (user.role !== "parent") {
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
      if (user.role !== "student") {
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

  if (!id) {
    return <></>;
  } else {
    return (
      <Card className="max-w-[1200px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Link Accounts</CardTitle>
          <CardDescription>
            <p className="text-sm">
              {role === "student"
                ? "Link your account to a parent account. This will allow the parent account to manage subscriptions, tutoring sessions and more."
                : "Link your account to a child account. You will be able to manage subscriptions, tutoring sessions and more."}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => handleLinkRequest(data))}
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
                        <Input readOnly {...field} />
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
                          isValidAccount ? "text-light-teal" : "text-red-500"
                        }`}
                      >
                        {accountCheckMessage}
                      </p>
                    )}
                  </FormItem>
                )}
              ></FormField>
              {isValidAccount && (
                <Button type="submit" className="hover-bg-light-teal mt-4">
                  Submit
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
};

export default AcceptLinkForm;
