import { initFirestore } from "@auth/firebase-adapter";
import { Credential } from "firebase-admin/app";
import { AppOptions } from "firebase-admin/app";
import admin from "firebase-admin";
import App from "next/app";

export const firestore = initFirestore({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});
