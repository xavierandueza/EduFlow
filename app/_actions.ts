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
import { LinkedUser } from "./utils/interfaces";

export async function createUser({
  id,
  firstName,
  lastName,
  email,
  role,
  image,
  yearLevel,
  subjects,
  school,
  interests,
  tutoringGoal,
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
  image: string | null;
  yearLevel?: number | null;
  subjects?: string[] | null;
  school?: string | null;
  interests?: string[] | null;
  tutoringGoal?: string | null;
  parentLink?: string | null;
  subscriptionActive?: boolean | null;
  subscriptionName?: string | null;
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
      // Create student in Db
      await setDoc(doc(db, "students", id), {
        firstName: firstName,
        lastName: lastName,
        image: image,
        email: email,
        yearLevel: yearLevel,
        subjects: subjects,
        school: school,
        interests: interests,
        tutoringGoal: tutoringGoal,
        parentLink: parentLink ? parentLink.trim() : null,
      });

      if (parentLink) {
        // Now update the parent doc
        await updateDoc(doc(db, "parents", parentLink.trim()), {
          childrenShort: arrayUnion(id),
          [`childrenLong.${id}`]: {
            firstName: firstName,
            lastName: lastName,
            image: image,
            email: email,
            yearLevel: yearLevel,
            subjects: subjects,
            school: school,
            interests: interests,
            subscriptionActive: subscriptionActive,
            subscriptionName: subscriptionName ? subscriptionName : null,
          },
        });
      }
    } catch (error) {
      console.error("error updating student: ", error);
      throw error;
    }
  } else if (role.toLowerCase() === "parent") {
    await setDoc(
      // create parent in the db
      doc(db, "parents", id),
      {
        firstName: firstName,
        lastName: lastName,
        image: image,
        email: email,
        childrenShort: [],
        childrenLong: {},
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
          parentLink: parentLink ? parentLink.trim() : null,
        },
        {
          merge: true,
        }
      );

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
  parentId,
}: {
  parentId: string;
}) {
  const parentDoc = await getDoc(doc(db, "parents", parentId));
  return parentDoc.data().childrenLong as {
    [id: string]: LinkedUser;
  };
}
