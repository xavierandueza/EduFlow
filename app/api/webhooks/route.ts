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
import { toCamelCase } from "../../utils/textManipulation";
import { User } from "next-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const allowedEventTypes = [
  "customer.subscription.created",
  "customer.subscription.deleted",
  "customer.subscription.resumed",
  "customer.subscription.paused",
  "customer.subscription.updated",
];

const updateSubscriptionStatus = async (
  stripeCustomerId: string,
  subscriptionActive: boolean,
  productName: string
) => {
  try {
    // first need to get the user
    const q = query(
      collection(db, "users"),
      where("stripeCustomerId", "==", stripeCustomerId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.error("No user found with stripeCustomerId: " + stripeCustomerId);
      return;
    }

    const user = querySnapshot.docs[0];

    if (!user.data()) {
      console.error(
        "User data undefined for stripeCustomerId: " + stripeCustomerId
      );
    }

    // update this document
    await updateDoc(user.ref, {
      subscriptionActive: subscriptionActive,
      subscriptionName: subscriptionActive ? productName : null,
    });

    if (!user.data().role) {
      return;
    } else if (user.data().role === "parent") {
      // get the parents document
      const parentDoc = await getDoc(doc(db, "parents", user.id));

      // loop over the linked students (the childrenShort array contains all Ids of the linked students)
      for (const linkedStudent of parentDoc.data().childrenShort) {
        // update the user account for the student
        try {
          await updateDoc(doc(db, "users", linkedStudent), {
            subscriptionActive: subscriptionActive,
            subscriptionName: subscriptionActive ? productName : null,
          });
        } catch (error) {
          console.error(
            "Could not update student user with id: " + linkedStudent
          );
          return;
        }
      }
      return;
    } else if (user.data().role === "student") {
      // get the student document
      const studentDoc = await getDoc(doc(db, "students", user.id));

      if (
        !studentDoc.data().parentLink ||
        studentDoc.data().parentLink === ""
      ) {
        return;
      } else {
        // Assume only one parent account for now
        try {
          await updateDoc(doc(db, "users", studentDoc.data().parentLink), {
            subscriptionActive: subscriptionActive,
            subscriptionName: subscriptionActive ? productName : null,
          });
        } catch (error) {
          console.error(
            "Error updating parent user with id: " +
              studentDoc.data().parentLink
          );
          return;
        }
      }
    }
  } catch (error) {
    console.error(
      "Could not update user with stripeCustomerId: " + stripeCustomerId
    );
    return;
  }
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const webhookHandler = async (req: NextRequest) => {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: { message: "Method not allowed" } },
      { status: 405 }
    ).headers.set("Allow", "POST");
  }

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

    if (!allowedEventTypes.includes(event.type)) {
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${event.type} is not a valid event type`,
          },
        },
        { status: 400 }
      );
    }

    console.log("🔔 Webhook received:", event.type);

    // Successfully constructed event.
    console.log("✅ Success:", event.id);
    const stripeCustomer = (event.data.object as Stripe.Subscription).customer;

    if (!stripeCustomer) {
      console.error("No stripe customer found");
      throw new Error("No stripe customer found on object");
    }

    const stripeCustomerId = stripeCustomer.toString();

    // need to get the product name
    let productId: string;

    // console.log((event.data.object as Stripe.Subscription).items.data[0]);

    try {
      productId = (event.data.object as Stripe.Subscription).items.data[0].price
        .product as string;

      console.log("productId: " + productId);
    } catch (error) {
      console.error("No priceId found on object");
      throw new Error("No priceId found on object");
    }

    if (!productId) {
      console.error("No priceId found on object");
      throw new Error("No priceId found on object");
    }

    // code to get the name of the product, convert to camelCase for the database
    const productName = toCamelCase(
      (await stripe.products.retrieve(productId)).name
    );

    console.log("productName: " + productName);

    switch (event.type) {
      case "customer.subscription.created":
        console.log("Handling customer.subscription.created");
        await updateSubscriptionStatus(stripeCustomerId, true, productName);
        break;
      case "customer.subscription.deleted":
        console.log("Handling customer.subscription.deleted");
        await updateSubscriptionStatus(stripeCustomerId, false, productName);
        break;
      case "customer.subscription.resumed":
        console.log("Handling customer.subscription.resumed");
        await updateSubscriptionStatus(stripeCustomerId, true, productName);
        break;
      case "customer.subscription.paused":
        console.log("Handling customer.subscription.paused");
        await updateSubscriptionStatus(stripeCustomerId, false, productName);
        break;
      case "customer.subscription.updated":
        console.log("Handling customer.subscription.updated");
        await updateSubscriptionStatus(stripeCustomerId, true, productName);
        break;
    }
    // successfully went through switch
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Unhandled error in webhook handler", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    ).headers.set("Allow", "POST");
  }
};

export { webhookHandler as POST };
