import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../pages/api/auth/[...nextauth]";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  // Check that the request exists
  if (!req.body) {
    return NextResponse.json({ error: "No request body" }, { status: 400 });
  }

  // Check that the body has been successfully obtained
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Check that the priceId exists
  if (!body.priceId) {
    return NextResponse.json(
      { error: "Missing priceId in request" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Must sign in
    return NextResponse.redirect("/api/auth/signin");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: session.user.stripeCustomerId,
    line_items: [
      {
        price: body.priceId,
        quantity: 1,
      },
    ],
    success_url: process.env.NEXT_PUBLIC_WEBSITE_URL + "/paymentSuccess",
    cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL,
    subscription_data: {
      // can put in a trial period from what copilot recommended
      trial_period_days: 14,
      metadata: {
        // more data attached to the subscription which can be used
        payingUserId: session.user.id,
      },
    },
  });

  // checking if the session returns a URL
  if (!checkoutSession.url) {
    return NextResponse.json(
      {
        error: {
          code: "stripe-error",
          message: "Could not create a checkout session",
        },
      },
      { status: 500 }
    );
  }

  // otherwise we return the checkout session
  return NextResponse.json({ session: checkoutSession }, { status: 200 });
}
