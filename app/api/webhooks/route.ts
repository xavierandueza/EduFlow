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
  arrayUnion,
} from "firebase/firestore";
import { toCamelCase } from "../../utils/textManipulation";

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
  productName: string,
  forStudentId: string
) => {
  try {
    // only want to update the user who has the forStudentId in the metadata

    // first need to update the user
    await updateDoc(doc(db, "users", forStudentId), {
      subscriptionActive: subscriptionActive,
      subscriptionName: subscriptionActive ? productName : null,
    });

    // Find if any parents have this user as a child
    const q = query(
      collection(db, "parents"),
      where("childrenShort", "array-contains", forStudentId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(
        "No children found with stripeCustomerId: " + stripeCustomerId
      );
      return;
    }

    // loop over the parents
    for (const parent of querySnapshot.docs) {
      // update the parent
      try {
        await updateDoc(parent.ref, {
          childrenShort: arrayUnion(forStudentId),
          childrenLong: {
            [`childrenLong.${forStudentId}`]: {
              stripeCustomerId: stripeCustomerId,
              subscriptionActive: subscriptionActive,
              subscriptionName: subscriptionActive ? productName : null,
            },
          },
        });
        console.log("Updated parent: ", parent.id);
      } catch (error) {
        console.error(
          "Could not update parent: ",
          parent.id,
          " with error: ",
          error
        );
      }
    }

    return;
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
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: No stripe customer found`,
          },
        },
        { status: 400 }
      );
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
      console.error("Could not get productId from event");
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: Could not get productId from event`,
          },
        },
        { status: 400 }
      );
    }

    if (!productId) {
      console.error("No productId found on object");
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: No productId found on object`,
          },
        },
        { status: 400 }
      );
    }

    // code to get the name of the product, convert to camelCase for the database
    const productName = toCamelCase(
      (await stripe.products.retrieve(productId)).name
    );

    // get the forStudentId from the metadata
    const forStudentId = (event.data.object as Stripe.Subscription).metadata
      .forStudentId;

    if (!forStudentId) {
      console.error("No forStudentId found on object");
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: No forStudentId found on object`,
          },
        },
        { status: 400 }
      );
    }

    const forStudentData = (event.data.object as Stripe.Subscription).metadata
      .forStudentId;

    if (!forStudentId) {
      console.error("No forStudentId found on object");
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: No forStudentId found on object`,
          },
        },
        { status: 400 }
      );
    }

    console.log("productName: " + productName);
    console.log("forStudentId: " + forStudentId);

    switch (event.type) {
      case "customer.subscription.created":
        console.log("Handling customer.subscription.created");
        await updateSubscriptionStatus(
          stripeCustomerId,
          true,
          productName,
          forStudentId
        );
        break;
      case "customer.subscription.deleted":
        console.log("Handling customer.subscription.deleted");
        await updateSubscriptionStatus(
          stripeCustomerId,
          false,
          productName,
          forStudentId
        );
        break;
      case "customer.subscription.resumed":
        console.log("Handling customer.subscription.resumed");
        await updateSubscriptionStatus(
          stripeCustomerId,
          true,
          productName,
          forStudentId
        );
        break;
      case "customer.subscription.paused":
        console.log("Handling customer.subscription.paused");
        await updateSubscriptionStatus(
          stripeCustomerId,
          false,
          productName,
          forStudentId
        );
        break;
      case "customer.subscription.updated":
        console.log("Handling customer.subscription.updated");
        await updateSubscriptionStatus(
          stripeCustomerId,
          true,
          productName,
          forStudentId
        );
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
