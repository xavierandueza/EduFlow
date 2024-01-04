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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
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
  adapter: FirestoreAdapter(firestore),
  session: {
    strategy: "database", // use database, which means it looks up in database using a hashed code value. Otherwise uses JWT
    maxAge: 30 * 24 * 60 * 60, // in seconds, so 14 days here
    updateAge: 24 * 60 * 60, // How frequently to update database for sessions, seconds again
    // generateSessionToken // If we want to generate our own session token, we don't care tho
  },
  pages: {
    newUser: "/account/signup", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export default NextAuth(authOptions);
