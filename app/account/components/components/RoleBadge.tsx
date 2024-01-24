import { Badge } from "@/components/ui/badge";

const RoleBadge = ({ role }: { role: string }) => {
  if (role) {
    switch (role) {
      case "parent":
        return (
          <div>
            <Badge>Parent/Guardian</Badge>
          </div>
        );
      case "student":
        return (
          <div>
            <Badge>Student</Badge>
          </div>
        );
    }
  } else {
    return (
      <div>
        <Badge className="cursor-pointer">No Role</Badge>
      </div>
    );
  }
};

export default RoleBadge;
