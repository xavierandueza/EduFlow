"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const SubscriptionBadge = ({
  subscriptionActive,
  subscriptionName,
}: {
  subscriptionActive: boolean;
  subscriptionName: string;
}) => {
  if (subscriptionActive) {
    switch (subscriptionName) {
      case "standardPlan":
        return (
          <Link href="/subscription">
            <Badge className="cursor-pointer">Standard Plan</Badge>
          </Link>
        );
      case "mediumPlan":
        return (
          <Link href="/subscription">
            <Badge className="cursor-pointer">Medium Plan</Badge>
          </Link>
        );
      case "deluxePlan":
        return (
          <Link href="/subscription">
            <Badge className="cursor-pointer">Deluxe Plan</Badge>
          </Link>
        );
    }
  } else {
    return (
      <Link href="/subscription">
        <Badge className="cursor-pointer">Subscribe Now</Badge>
      </Link>
    );
  }
};

export default SubscriptionBadge;
