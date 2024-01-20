import { useEffect, useState } from "react";
import UserDisplay from "./UserDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getParentFromDb,
  getStudentFromDb,
} from "@/app/utils/databaseFunctionsFirestore";
import { LinkedUser } from "@/app/utils/interfaces";
import { Link2Icon } from "lucide-react";
import DeleteLinkedAccountAlertDialog from "./components/DeleteLinkedAccountAlertDialog";
import ContactLinkedAccountDialog from "./components/ContactLinkedAccountDialog";
import LinkAccountDialog from "./components/LinkAccountDialog";
import ManageLinkRequestDialog from "./components/ManageLinkRequestDialog";

const LinkedAccountsCard = ({
  userId,
  role,
  firstName,
  lastName,
}: {
  userId: string;
  role: string;
  firstName: string;
  lastName: string;
}) => {
  // if a student, we need the parents account
  // if a parent, we can actually just get the parent account which has their summaries
  // Create the states for the linked accounts
  const [linkedAccounts, setLinkedAccounts] = useState<{
    [id: string]: LinkedUser;
  }>(null);

  // Load in the relevant information on component load
  useEffect(() => {
    // fetch parent data using the child id
    if (role === "student") {
      const fetchData = async () => {
        const data = await getStudentFromDb({ id: userId, role: role });
        // set the linked accounts as just the parentLong
        // console.log(data);
        console.log(data.parentsLong);
        console.log(Object.keys(data.parentsLong));
        setLinkedAccounts(data.parentsLong as { [id: string]: LinkedUser });
      };

      // Only fetch if we don't have the data
      if (!linkedAccounts) {
        fetchData();
      }
    } else if (role === "parent") {
      /* Make sure logic here works as intended.
      const fetchData = async () => {
        const data = await getStudentFromDb({ parentId: id });
        setLinkedAccounts(data);
      };

      if (!linkedAccounts) {
        fetchData();
      }
      */
    }
  });

  if (!linkedAccounts) {
    return <></>;
  } else {
    if (role === "student") {
      // student, so the linked accounts are parents
      return (
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-2xl font-bold">
                  Linked Accounts
                </CardTitle>
                <CardDescription>
                  <p>
                    These are the parent accounts that are linked to your
                    account.
                  </p>
                </CardDescription>
              </div>
              <Link2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {Object.keys(linkedAccounts).map((id) => {
                return (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-row items-center justify-between">
                        <UserDisplay
                          key={id}
                          firstName={linkedAccounts[id].firstName}
                          lastName={linkedAccounts[id].lastName}
                          image={linkedAccounts[id].image}
                          includeSubscriptionBadge={false}
                          role={"parent"}
                          childAcceptedRequest={
                            linkedAccounts[id].childAcceptedRequest
                          }
                          parentAcceptedRequest={
                            linkedAccounts[id].parentAcceptedRequest
                          }
                          includeLinkingInfo={true}
                        />
                        <div className="flex flex-row space-x-2">
                          <ManageLinkRequestDialog
                            role={role}
                            childId={userId}
                            childFirstName={firstName}
                            childLastName={lastName}
                            childAcceptedRequest={
                              linkedAccounts[id].childAcceptedRequest
                            }
                            parentAcceptedRequest={
                              linkedAccounts[id].parentAcceptedRequest
                            }
                            parentId={id}
                            parentFirstName={linkedAccounts[id].firstName}
                            parentLastName={linkedAccounts[id].lastName}
                          />
                          <ContactLinkedAccountDialog
                            email={linkedAccounts[id].email}
                            firstName={linkedAccounts[id].firstName}
                            lastName={linkedAccounts[id].lastName}
                          />
                          <DeleteLinkedAccountAlertDialog role={role} />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <LinkAccountDialog id={userId} role={role} />
          </CardFooter>
        </Card>
      );
    }
  }
};

export default LinkedAccountsCard;
