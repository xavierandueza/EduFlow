import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "../firestore";
import { Session, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import Stripe from "stripe";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../../app/firebase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          stripeCustomerId: null, // payments
          subscriptionActive: false, // payments
          subscriptionName: null, // payments
          firstName: null,
          lastName: null,
          role: null, // parent, student, teacher
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    }) {
      session.user.id = user.id;
      session.user.firstName = user.firstName;
      session.user.lastName = user.lastName;
      session.user.role = user.role;
      session.user.stripeCustomerId = user.stripeCustomerId;
      session.user.subscriptionActive = user.subscriptionActive;
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-10-16",
      });

      await stripe.customers
        .create({
          email: user.email!, // this is subject to change through account
          name: user.name!,
        })
        .then(async (customer) => {
          return await setDoc(
            doc(db, "users", user.id),
            {
              stripeCustomerId: customer.id,
            },
            { merge: true }
          );
        });
    },
  },
  pages: {
    newUser: "/account/signup", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export default NextAuth(authOptions);
