// File: /pages/api/stripe/checkout-session.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Parse the request body
    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: "No request body" });
    }

    // Check that the priceId exists
    if (!body.priceId) {
      return res.status(400).json({ error: "Missing priceId in request" });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    // Get the session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      // Must sign in
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: session.user.stripeCustomerId,
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/paymentSuccess`,
      cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL,
      subscription_data: {
        trial_period_days: 14,
        metadata: { payingUserId: session.user.id },
      },
    });

    // Check if the session returns a URL
    if (!checkoutSession.url) {
      return res.status(500).json({
        error: {
          code: "stripe-error",
          message: "Could not create a checkout session",
        },
      });
    }

    // Return the checkout session
    return res.status(200).json({ session: checkoutSession });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        code: "internal-server-error",
        message: "Internal server error",
      },
    });
  }
}
