import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, Clock4 } from "lucide-react";
import { camelCaseToNormalTextCapitalized } from "@/app/utils/textManipulation";
import { Progress } from "@/components/ui/progress";

const ChildDetailCards = ({
  firstName,
  lastName,
  subscriptionActive,
  subscriptionName,
  role,
}: {
  firstName: string;
  lastName: string;
  subscriptionActive: boolean;
  subscriptionName: string;
  role: string;
}) => {
  if (role === "parent") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Child's Name</CardTitle>
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {firstName && lastName ? `${firstName} ${lastName}` : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Subscription Plan
            </CardTitle>
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionActive
                ? camelCaseToNormalTextCapitalized(subscriptionName)
                : "Unsubscribed"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Clock4 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours</div>
            <Progress className="mt-2 h-4" value={50} />
          </CardContent>
        </Card>
      </div>
    );
  } else if (role === "student") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Name</CardTitle>
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {firstName && lastName ? `${firstName} ${lastName}` : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Subscription Plan
            </CardTitle>
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionActive
                ? camelCaseToNormalTextCapitalized(subscriptionName)
                : "Unsubscribed"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Clock4 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours</div>
            <Progress className="mt-2 h-4" value={50} />
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default ChildDetailCards;
