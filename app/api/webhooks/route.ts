import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase";
import {
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  collection,
  where,
  limit,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const updateSubscriptionStatus = async (
  stripeCustomerId: string,
  isActive: boolean
) => {
  // first need to get the user
  const q = query(
    collection(db, "users"),
    where("stripeCustomerId", "==", stripeCustomerId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  const user = querySnapshot.docs[0];

  // update this document
  // update the parent account
  await updateDoc(user.ref, {
    isActive: isActive,
  });

  // now that we have the user, we will also need to check the subscription of any linked accounts
  // different linking status depending on parent, student
  if (user.data().role === "parent") {
    // get the parents document
    const parentDoc = await getDoc(doc(db, "parents", user.id));

    // loop over the linked students (the childrenShort array contains all Ids of the linked students)
    for (const linkedStudent of parentDoc.data().childrenShort) {
      // update the user account for the student
      try {
        await updateDoc(doc(db, "users", linkedStudent), {
          isActive: isActive,
        });
      } catch (error) {
        console.log("Could not update student user with id: " + linkedStudent);
      }
    }

    return;
  } else if (user.data().role === "student") {
    // get the student document
    const studentDoc = await getDoc(doc(db, "students", user.id));

    if (!studentDoc.data().parentLink || studentDoc.data().parentLink === "") {
      return;
    } else {
      // Assume only one parent account for now
      try {
        await updateDoc(doc(db, "users", studentDoc.data().parentLink), {
          isActive: isActive,
        });
      } catch (error) {
        console.log(
          "Error updating parent user with id: " + studentDoc.data().parentLink
        );
      }
    }
  }
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const webhookHandler = async (req: NextRequest) => {
  try {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      // On error, log and return the error message.
      if (!(err instanceof Error)) console.log(err);
      console.log(`❌ Error message: ${errorMessage}`);

      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${errorMessage}`,
          },
        },
        { status: 400 }
      );
    }

    // Successfully constructed event.
    console.log("✅ Success:", event.id);
    const stripeCustomerId = (
      event.data.object as Stripe.Subscription
    ).customer.toString();

    switch (event.type) {
      case "customer.subscription.created":
        await updateSubscriptionStatus(stripeCustomerId, true);
        break;
      case "customer.subscription.deleted":
        await updateSubscriptionStatus(stripeCustomerId, false);
        break;
      case "customer.subscription.resumed":
        await updateSubscriptionStatus(stripeCustomerId, true);
        break;
      case "customer.subscription.paused":
        await updateSubscriptionStatus(stripeCustomerId, false);
        break;
      case "customer.subscription.updated":
        await updateSubscriptionStatus(stripeCustomerId, true);
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Method not allowed" } },
      { status: 405 }
    ).headers.set("Allow", "POST");
  }
};

export { webhookHandler as POST };
