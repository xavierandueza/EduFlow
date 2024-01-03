"use client";
// can use middleware or in-page code to check if user is authenticated
import UserProfileForm from "../../ui/account/UserProfileForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import getStripe from "../../utils/getStripe";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const priceId = "price_1OUJxgImHqPDmYHJLtML8m2E";

  const handleCreateCheckoutSession = async (priceId: string) => {
    try {
      const res = await fetch(`/api/stripe/checkout-session`, {
        method: "POST",
        body: JSON.stringify({ priceId: priceId }),
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
    } // else actually load the page
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null; // Or a loading indicator, or nothing if redirect is fast
  }

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-2xl font-bold">Profile</h1>

        <UserProfileForm />
        <button
          className="bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1"
          onClick={() => handleCreateCheckoutSession(priceId)}
        >
          Go To Checkout
        </button>
      </div>
    </section>
  );
};

export default Page;
