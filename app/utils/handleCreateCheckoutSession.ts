import getStripe from "./getStripe";
import { FirestoreParentChildLong } from "./interfaces";

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

export default handleCreateCheckoutSession;
