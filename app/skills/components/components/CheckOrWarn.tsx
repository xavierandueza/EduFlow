import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CheckOrWarn = ({
  status,
  revision = false,
}: {
  status: boolean;
  revision?: boolean;
}) => {
  if (revision) {
    return (
      <div className="flex flex-row justify-center">
        {status ? (
          <AlertTriangle className="h-5 w-5 fill-yellow-400" />
        ) : (
          <Minus className="h-5 w-5" />
        )}
      </div>
    );
  } else {
    return (
      <div className="flex flex-row justify-center">
        {status ? (
          <CheckCircle2 className="h-5 w-5 fill-dark-teal" />
        ) : (
          <AlertTriangle className="h-5 w-5 fill-yellow-400" />
        )}
      </div>
    );
  }
};

export default CheckOrWarn;
