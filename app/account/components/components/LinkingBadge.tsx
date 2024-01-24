import { Badge } from "@/components/ui/badge";

const LinkingBadge = ({
  childAcceptedRequest,
  parentAcceptedRequest,
  role,
}: {
  childAcceptedRequest: boolean;
  parentAcceptedRequest: boolean;
  role: string;
}) => {
  if (role === "student") {
    if (childAcceptedRequest && parentAcceptedRequest) {
      return (
        <div>
          <Badge className="bg-light-teal">Linked</Badge>
        </div>
      );
    } else if (childAcceptedRequest && !parentAcceptedRequest) {
      // you've sent the request, they haven't accepted, so it's pending
      return (
        <div>
          <Badge className="bg-dark-teal">Pending</Badge>
        </div>
      );
    } else if (!childAcceptedRequest && parentAcceptedRequest) {
      // they've requested, you haven't accepted, so it's requested
      return (
        <div>
          <Badge className="bg-dark-teal">Requested</Badge>
        </div>
      );
    } else {
      return null;
    }
  } else if (role === "parent") {
    if (childAcceptedRequest && parentAcceptedRequest) {
      return (
        <div>
          <Badge className="bg-light-teal">Linked</Badge>
        </div>
      );
    } else if (!childAcceptedRequest && parentAcceptedRequest) {
      // you've sent the request, they haven't accepted, so it's pending
      return (
        <div>
          <Badge className="bg-dark-teal">Pending</Badge>
        </div>
      );
    } else if (childAcceptedRequest && !parentAcceptedRequest) {
      // they've requested, you haven't accepted, so it's requested
      return (
        <div>
          <Badge className="bg-dark-teal">Requested</Badge>
        </div>
      );
    } else {
      return null;
    }
  }
};

export default LinkingBadge;
