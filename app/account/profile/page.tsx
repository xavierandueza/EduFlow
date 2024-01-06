"use client";
// can use middleware or in-page code to check if user is authenticated
import UserProfileForm from "../../ui/account/UserProfileForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getStripe from "../../utils/getStripe";
import { getStudentDataFromParents } from "../../_actions";
import { FirestoreParentChildLong } from "../../utils/interfaces";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const priceId = process.env.NEXT_PUBLIC_STANDARD_PLAN_PRICE_ID;
  const [parentStudentData, setParentStudentData] = useState<{
    [id: string]: FirestoreParentChildLong;
  }>(null);

  const handleCreateCheckoutSession = async (
    priceId: string,
    studentId: string,
    studentData: FirestoreParentChildLong
  ) => {
    try {
      const res = await fetch(`/api/stripe/checkoutSession`, {
        method: "POST",
        body: JSON.stringify({ priceId, studentId, studentData }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const checkoutSession = await res.json();

      if (res.ok) {
        const stripe = await getStripe();
        await stripe.redirectToCheckout({
          sessionId: checkoutSession.session.id,
        });
      } else {
        // Handle errors here
        console.warn(
          checkoutSession.error
            ? checkoutSession.error.message
            : "Error creating checkout session"
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      router.push("/auth/signin"); // Need to log in before accessing this page
    } else if (status === "authenticated" && !session?.user?.role) {
      router.push("/account/signup");
    } else if (session?.user?.role === "parent") {
      const fetchData = async () => {
        const data = await getStudentDataFromParents({
          parentLink: session?.user?.id,
        });
        setParentStudentData(data);
      };
      if (!parentStudentData) {
        // only fetch if we don't have the data
        fetchData();
      }
    }
    // else actually load the page
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null; // Or a loading indicator, or nothing if redirect is fast
  }

  const renderStudentCheckoutButtons = () => {
    switch (session?.user?.role) {
      case "parent": {
        return parentStudentData
          ? Object.entries(parentStudentData).map(([key, student]) => (
              <button
                className="bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1"
                onClick={() =>
                  handleCreateCheckoutSession(priceId, key, student)
                }
              >
                Pay for {student.firstName} {student.lastName}
              </button>
            ))
          : null;
      }
      case "student": {
        return (
          <button
            className="bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1"
            onClick={() =>
              handleCreateCheckoutSession(priceId, session?.user?.id, null)
            }
          >
            Subscribe now
          </button>
        );
      }
    }
  };

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-2xl font-bold">Profile</h1>

        <UserProfileForm />

        {renderStudentCheckoutButtons()}
      </div>
    </section>
  );
};

export default Page;
