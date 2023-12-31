import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "../firestore";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export default NextAuth({
  providers: [
    GoogleProvider({
      profile(profile) {
        return { 
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          extraInfoInputted: false,
        }
      },
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks : {
    session({session, token, user} : {session: Session, token: JWT, user: AdapterUser}) {
      session.user.extraInfoInputted = user.extraInfoInputted;
      return session
    }
  },
  adapter: FirestoreAdapter(firestore),
  session: {
    strategy: "database", // use database, which means it looks up in database using a hashed code value. Otherwise uses JWT
    maxAge: 30 * 24 * 60 * 60, // in seconds, so 14 days here
    updateAge: 24 * 60 * 60, // How frequently to update database for sessions, seconds again
    // generateSessionToken // If we want to generate our own session token, we don't care tho
  },
});
