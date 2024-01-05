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
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
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
