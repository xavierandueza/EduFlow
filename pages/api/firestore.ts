import { initFirestore } from "@auth/firebase-adapter";
import admin from "firebase-admin";

export const firestore = initFirestore({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});
