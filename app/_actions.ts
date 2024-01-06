"use server";

// import { updateUser } from '@/lib/mongo/users'
import { db } from "./firebase";
import {
  Firestore,
  arrayUnion,
  getDoc,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Role } from "./utils/interfaces";
import { FirestoreParentChildLong } from "./utils/interfaces";

export async function createUser({
  id,
  firstName,
  lastName,
  email,
  role,
  interests,
  careerGoals,
  parentLink,
  subscriptionActive,
  subscriptionName,
  firestoreDb = db,
}: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  interests: string[] | string | null;
  careerGoals: string[] | string | null;
  parentLink: string | null;
  subscriptionActive: boolean | null;
  subscriptionName: string | null;
  firestoreDb?: Firestore;
}) {
  // need to go ahead and update the user in the database
  await setDoc(
    doc(db, "users", id),
    {
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role.toLowerCase(),
    },
    {
      merge: true,
    }
  );

  // if the role is student, create OR update a student. So need to check if the student exists first
  if (role.toLowerCase() === "student") {
    try {
      // Update student
      await setDoc(
        doc(db, "students", id),
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          interests: interests,
          careerGoals: careerGoals,
          parentLink: parentLink.trim(),
        },
        {
          merge: true,
        }
      );

      // Now update the parent doc
      await updateDoc(doc(db, "parents", parentLink.trim()), {
        childrenShort: arrayUnion(id),
        [`childrenLong.${id}`]: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          interests: interests,
          careerGoals: careerGoals,
          subscriptionActive: subscriptionActive,
          subscriptionName: subscriptionName ? subscriptionName : null,
        },
      });
    } catch (error) {
      console.error("error updating student: ", error);
      throw error;
    }
  } else if (role.toLowerCase() === "parent") {
    await setDoc(
      doc(db, "parents", id),
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        childrenShort: [],
        childrenLong: {},
      },
      {
        merge: true,
      }
    );
  }

  return true;
}

export async function updateUser({
  id,
  firstName,
  lastName,
  email,
  role,
  interests,
  careerGoals,
  parentLink,
  subscriptionActive,
  subscriptionName,
  firestoreDb = db,
}: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  interests: string[] | string | null;
  careerGoals: string[] | string | null;
  parentLink: string | null;
  subscriptionActive: boolean | null;
  subscriptionName: string | null;
  firestoreDb?: Firestore;
}) {
  // need to go ahead and update the user in the database
  await setDoc(
    doc(firestoreDb, "users", id),
    {
      firstName: firstName,
      lastName: lastName,
      email: email,
    },
    {
      merge: true,
    }
  );

  // if the role is student, create OR update a student. So need to check if the student exists first
  if (role.toLowerCase() === "student") {
    try {
      // Update student
      await setDoc(
        doc(firestoreDb, "students", id),
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          interests: interests,
          careerGoals: careerGoals,
          parentLink: parentLink.trim(),
        },
        {
          merge: true,
        }
      );

      console.log("Trimmed parentLink: ", parentLink.trim());
      console.log("parentLink: ", parentLink);

      // Now update the parent doc
      await updateDoc(doc(firestoreDb, "parents", parentLink), {
        childrenShort: arrayUnion(id),
        childrenLong: {
          [`${id}`]: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            interests: interests,
            careerGoals: careerGoals,
            subscriptionActive: subscriptionActive,
            subscriptionName: subscriptionName ? subscriptionName : null,
          },
        },
      });
    } catch (error) {
      console.error("error updating student: ", error);
      throw error;
    }
  } else if (role.toLowerCase() === "parent") {
    await setDoc(
      doc(firestoreDb, "parents", id),
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        childrenShort: [],
        childrenLong: {},
      },
      {
        merge: true,
      }
    );
  }

  return true;
}

export async function getRoleExtraData({
  id,
  role,
}: {
  id: string;
  role: Role;
}) {
  switch (role) {
    case "student":
      const studentDoc = await getDoc(doc(db, "students", id));
      return studentDoc.data();
    case "parent":
      const parentDoc = await getDoc(doc(db, "parents", id));
      return parentDoc.data();
    case "teacher":
      const teacherDoc = await getDoc(doc(db, "teachers", id));
      return teacherDoc.data();
  }
}

export async function getStudentDataFromParents({
  parentLink,
}: {
  parentLink: string;
}) {
  const parentDoc = await getDoc(doc(db, "parents", parentLink));
  return parentDoc.data().childrenLong as {
    [id: string]: FirestoreParentChildLong;
  };
}
