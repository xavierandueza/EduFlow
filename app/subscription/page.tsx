"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SubscriptionPlan } from "../utils/interfaces";
import SubscriptionPlanCard from "../ui/subscription/SubscriptionPlanCard";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const studentId = searchParams.get("studentId");

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while loading
      // don't care about the unauthenticated status, that comes up later
    } else if (status === "authenticated" && !session?.user?.role) {
      router.push("/account/signup"); // need to finish acc creation
    } else {
      const fetchedPlans = [
        {
          planName: "Standard Plan",
          planPrice: 10,
          planDescription: "This is the standard plan",
          majorPoints: {
            "Point 1": true,
            "Point 2": true,
            "Point 3": false,
            "Point 4": false,
          },
          priceId: process.env.NEXT_PUBLIC_STANDARD_PLAN_PRICE_ID,
          studentId: studentId ? studentId : null,
          session: session,
        },
        {
          planName: "Medium Plan",
          planPrice: 20,
          planDescription: "This is the medium plan",
          majorPoints: {
            "Point 1": true,
            "Point 2": true,
            "Point 3": true,
            "Point 4": false,
          },
          priceId: process.env.NEXT_PUBLIC_MEDIUM_PLAN_PRICE_ID,
          studentId: studentId ? studentId : null,
          session: session,
        },
        {
          planName: "Premium Plan",
          planPrice: 30,
          planDescription: "This is the premium plan",
          majorPoints: {
            "Point 1": true,
            "Point 2": true,
            "Point 3": true,
            "Point 4": true,
          },
          priceId: process.env.NEXT_PUBLIC_DELUXE_PLAN_PRICE_ID,
          studentId: studentId ? studentId : null,
          session: session,
        },
      ];
      setSubscriptionPlans(fetchedPlans);
    }
  }, [status, session, router]);

  return (
    <div className="w-full flex flex-wrap justify-center items-center">
      {subscriptionPlans.map((plan) => (
        <SubscriptionPlanCard
          key={plan.priceId}
          planName={plan.planName}
          planPrice={plan.planPrice}
          planDescription={plan.planDescription}
          majorPoints={plan.majorPoints}
          priceId={plan.priceId}
          studentId={plan.studentId}
          router={router}
          session={session}
        />
      ))}
    </div>
  );
}
