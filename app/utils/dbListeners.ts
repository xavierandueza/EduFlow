"use client";

import { db } from "../firebase";
import { TutoringSession } from "@/app/utils/interfaces";
import { collection, query, onSnapshot } from "firebase/firestore";

const listenToTutoringSessions = async (
  studentId: string,
  onUpdate: (sessions: { [id: string]: TutoringSession }[]) => void
) => {
  const firestoreDb = db;
  const q = collection(firestoreDb, "students", studentId, "tutoringSessions");
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      onUpdate([]);
    } else {
      const sessions = querySnapshot.docs.map((doc) => {
        return { [doc.id]: doc.data() } as { [id: string]: TutoringSession };
      });
      onUpdate(sessions);
    }
  });

  return unsubscribe;
};

export { listenToTutoringSessions };
