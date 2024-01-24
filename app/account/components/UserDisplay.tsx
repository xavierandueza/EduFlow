import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SubscriptionBadge from "./components/SubscriptionBadge";
import RoleBadge from "./components/RoleBadge";
import LinkingBadge from "./components/LinkingBadge";

const UserDisplay = ({
  firstName,
  lastName,
  image,
  subscriptionActive,
  subscriptionName,
  includeSubscriptionBadge = true,
  includeLinkingInfo = false,
  childAcceptedRequest,
  parentAcceptedRequest,
  role,
}: {
  firstName: string;
  lastName: string;
  image: string;
  subscriptionActive?: boolean;
  subscriptionName?: string;
  includeSubscriptionBadge?: boolean;
  includeLinkingInfo?: boolean;
  childAcceptedRequest?: boolean;
  parentAcceptedRequest?: boolean;
  role?: string;
}) => {
  return (
    <div className="flex flex-row items-center">
      <Avatar className="w-14 h-14 mt-1">
        <AvatarImage
          src={image}
          alt={`${firstName} ${lastName}'s display picture`}
        />
        <AvatarFallback>
          {firstName[0].toUpperCase() + lastName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col ml-4">
        <h3 className="text-2xl font-semibold">
          {firstName} {lastName}
        </h3>
        <div className="flex flex-row space-x-1">
          {includeSubscriptionBadge ? (
            <SubscriptionBadge
              subscriptionActive={subscriptionActive}
              subscriptionName={subscriptionName}
            />
          ) : (
            <RoleBadge role={role} />
          )}
          {includeLinkingInfo && (
            <LinkingBadge
              childAcceptedRequest={childAcceptedRequest}
              parentAcceptedRequest={parentAcceptedRequest}
              role={role}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDisplay;
