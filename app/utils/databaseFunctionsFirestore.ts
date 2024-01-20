"use server";

import {
  FirestoreStudent,
  FirestoreStudentSkill,
  SchoolClassSkill,
  FirestoreTeacher,
  FirestoreSchoolClass,
  FirestoreSkillAggregate,
  FirestoreStudentAggregate,
  FirestoreExtendedUser,
  TutoringSession,
  FirestoreParent,
} from "./interfaces";

import { db } from "../firebase";
import {
  collection,
  getDoc,
  getDocs,
  query,
  limit,
  where,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  deleteDoc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

async function getSchoolClassSkillFromDB(
  id?: string,
  schoolClass?: string,
  skill?: string,
  firestoreDb = db
) {
  try {
    if (id) {
      const docSnapshot = await getDoc(
        doc(firestoreDb, "schoolClassSkills", id)
      );

      if (docSnapshot.exists) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as SchoolClassSkill;
      } else {
        throw new Error("No schoolClassSkill found");
      }
    } else if (schoolClass && skill) {
      const q = query(
        collection(firestoreDb, "schoolClassSkills"),
        where("schoolClass", "==", schoolClass),
        where("skill", "==", skill),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as SchoolClassSkill;
      } else {
        throw new Error("No schoolClassSkill found");
      }
    } else {
      throw new Error("Cannot find unique schoolClassSkill with inputted data");
    }
  } catch (error) {
    console.error(`Error getting studentSkill documents for id: ${id}`, error);
    throw error;
  }
}

const getStudentFromDb = async ({ id, role }: { id: string; role: string }) => {
  // logic for loading in student
  try {
    if (role === "student") {
      // just get the doc and return it
      const studentDoc = await getDoc(doc(db, "students", id));

      return studentDoc.data() as FirestoreStudent;
    } else if (role === "parent") {
      // logic here later
    } else {
      throw new Error("Invalid role provided: " + role);
    }
  } catch (error) {
    console.error(
      `Error getting student document of id: ${id} and role ${role}. Specific error of: ${error}`
    );
    return null;
  }
};

async function getStudentSkillFromDB(
  id?: string,
  email?: string,
  skill?: string,
  firestoreDb = db
) {
  try {
    // console.log("printing ID: ")
    // console.log(id)
    if (id) {
      const docSnapshot = await getDoc(doc(firestoreDb, "studentSkills", id));

      if (docSnapshot.exists) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as FirestoreStudentSkill;
      } else {
        throw new Error("No studentSkill found");
      }
    } else if (email && skill) {
      const q = query(
        collection(firestoreDb, "studentSkills"),
        where("email", "==", email),
        where("skill", "==", skill),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as FirestoreStudentSkill;
      } else {
        throw new Error("No studentSkill found");
      }
    } else {
      throw new Error("Cannot find unique studentSkill with inputted data");
    }
  } catch (error) {
    console.error(`Error getting studentSkill documents for id: ${id}`, error);
    throw error;
  }
}

async function getStudentSkillFromDBAll(email: string, firestoreDb = db) {
  const q = query(
    collection(firestoreDb, "studentSkills"),
    where("email", "==", email)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as FirestoreStudentSkill;
      });
    } else {
      throw new Error("No studentSkill found");
    }
  } catch (error) {
    console.error(
      `Error getting all studentSkill documents of email ${email}`,
      error
    );
    throw error;
  }
}

async function getTeacherFromDB(email: string, firestoreDb = db) {
  const q = query(
    collection(firestoreDb, "teachers"),
    where("email", "==", email),
    limit(1)
  );
  const docSnapshot = (await getDocs(q)).docs[0];

  try {
    if (docSnapshot.exists) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as FirestoreTeacher;
    } else {
      throw new Error("No teacher found");
    }
  } catch (error) {
    console.error(`Error getting teacher document of email ${email}`, error);
    throw error;
  }
}

async function getSchoolClassFromDB(schoolClassName: string, firestoreDb = db) {
  const q = query(
    collection(firestoreDb, "schoolClasses"),
    where("name", "==", schoolClassName),
    limit(1)
  );
  getDocs(q).then((querySnapshot) => {
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirestoreSchoolClass;
    } else {
      throw new Error("No schoolClass found");
    }
  });
}

// this function aggregates skill values for a class - so we should be able to feed in the class and do some aggregation over.
async function getAggregatedSkillsForClass(
  schoolClassId: string,
  firestoreDb = db
) {
  try {
    // get the list of student skills for this class
    const studentSkillsQuery = query(
      collection(firestoreDb, "studentSkills"),
      where("schoolClassID", "==", schoolClassId)
    );
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery);
    const studentSkills = studentSkillsQuerySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as FirestoreStudentSkill;
    });

    // console.log(`Student Skills of length: ${studentSkills.length}`);

    // use a map
    const skillMap: Record<string, FirestoreSkillAggregate> = {};

    studentSkills.forEach((studentSkill) => {
      const {
        skill,
        schoolClass,
        masteryScore,
        retentionScore,
        needToRevise,
        areDependenciesMet,
      } = studentSkill;

      if (!skillMap[skill]) {
        skillMap[skill] = {
          skill,
          schoolClass,
          masteryScore: 0,
          retentionScore: 0,
          noStudentsNotMetMastery: 0,
          noStudentsNotMetDependencies: 0,
          noStudentsToRevise: 0,
        };
      }

      skillMap[skill].masteryScore += masteryScore;
      skillMap[skill].retentionScore += retentionScore;
      if (masteryScore < 50) {
        skillMap[skill].noStudentsNotMetMastery += 1;
      }
      if (!areDependenciesMet) {
        skillMap[skill].noStudentsNotMetDependencies += 1;
      }
      if (needToRevise) {
        skillMap[skill].noStudentsToRevise += 1;
      }
    });

    // console.log("mapping successful");

    // Calculate averages and return the array
    return Object.values(skillMap).map((skillAggregate) => {
      const count = studentSkills.filter(
        (ss) => ss.skill === skillAggregate.skill
      ).length;
      return {
        ...skillAggregate,
        masteryScore: skillAggregate.masteryScore / count,
        retentionScore: skillAggregate.retentionScore / count,
      };
    }) as FirestoreSkillAggregate[];
  } catch (error) {
    console.error("Error aggregating skills data:", error);
    throw error; // Propagate the error
  }
}

// Gets the aggregated skills for each student in a class
async function getAggregatedStudentsForClass(
  schoolClassId: string,
  firestoreDb = db
) {
  try {
    const studentSkillsQuery = query(
      collection(firestoreDb, "studentSkills"),
      where("schoolClassID", "==", schoolClassId)
    );
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery);
    const studentSkills = studentSkillsQuerySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as FirestoreStudentSkill;
    });

    const studentMap: Record<string, FirestoreStudentAggregate> = {};

    studentSkills.forEach((studentSkill) => {
      const {
        firstName,
        lastName,
        email,
        schoolClass,
        masteryScore,
        retentionScore,
        needToRevise,
      } = studentSkill;
      const fullName = `${firstName} ${lastName}`;

      if (!studentMap[email]) {
        studentMap[email] = {
          fullName,
          email,
          schoolClass: schoolClass,
          masteryScore: 0,
          retentionScore: 0,
          skillsToRevise: 0,
        };
      }

      studentMap[email].masteryScore += masteryScore;
      studentMap[email].retentionScore += retentionScore;
      if (needToRevise) {
        studentMap[email].skillsToRevise += 1;
      }
    });

    // Calculate averages and return the array
    return Object.values(studentMap).map((studentAggregate) => {
      const count = studentSkills.filter(
        (ss) => ss.email === studentAggregate.email
      ).length;
      return {
        ...studentAggregate,
        masteryScore: studentAggregate.masteryScore / count,
        retentionScore: studentAggregate.retentionScore / count,
      };
    }) as FirestoreStudentAggregate[];
  } catch (error) {
    console.error("Error aggregating students data:", error);
    throw error; // Propagate the error
  }
}

async function getAggregatedStudentsAndSkillsForClass(
  schoolClassId: string,
  firestoreDb = db
) {
  const studentSkillsQuery = query(
    collection(firestoreDb, "studentSkills"),
    where("schoolClassID", "==", schoolClassId)
  );
  try {
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery);

    const studentSkills = studentSkillsQuerySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as FirestoreStudentSkill;
    });

    // create the student and skill maps
    const studentMap: Record<string, FirestoreStudentAggregate> = {};
    const skillMap: Record<string, FirestoreSkillAggregate> = {};

    // do the student first
    studentSkills.forEach((studentSkill) => {
      const {
        firstName,
        lastName,
        email,
        schoolClass,
        masteryScore,
        retentionScore,
        needToRevise,
      } = studentSkill;
      const fullName = `${firstName} ${lastName}`;

      if (!studentMap[email]) {
        studentMap[email] = {
          fullName,
          email,
          schoolClass: schoolClass,
          masteryScore: 0,
          retentionScore: 0,
          skillsToRevise: 0,
        };
      }

      studentMap[email].masteryScore += masteryScore;
      studentMap[email].retentionScore += retentionScore;
      if (needToRevise) {
        studentMap[email].skillsToRevise += 1;
      }
    });

    // Calculate averages and return the array
    const aggregatedStudents = Object.values(studentMap).map(
      (studentAggregate) => {
        const count = studentSkills.filter(
          (ss) => ss.email === studentAggregate.email
        ).length;
        return {
          ...studentAggregate,
          masteryScore: studentAggregate.masteryScore / count,
          retentionScore: studentAggregate.retentionScore / count,
        };
      }
    ) as FirestoreStudentAggregate[];

    // do the skills next
    studentSkills.forEach((studentSkill) => {
      const {
        skill,
        schoolClass,
        masteryScore,
        retentionScore,
        needToRevise,
        areDependenciesMet,
      } = studentSkill;

      if (!skillMap[skill]) {
        skillMap[skill] = {
          skill,
          schoolClass,
          masteryScore: 0,
          retentionScore: 0,
          noStudentsNotMetMastery: 0,
          noStudentsNotMetDependencies: 0,
          noStudentsToRevise: 0,
        };
      }

      skillMap[skill].masteryScore += masteryScore;
      skillMap[skill].retentionScore += retentionScore;
      if (masteryScore < 50) {
        skillMap[skill].noStudentsNotMetMastery += 1;
      }
      if (!areDependenciesMet) {
        skillMap[skill].noStudentsNotMetDependencies += 1;
      }
      if (needToRevise) {
        skillMap[skill].noStudentsToRevise += 1;
      }
    });

    // Calculate averages and return the array
    const aggregatedSkills = Object.values(skillMap).map((skillAggregate) => {
      const count = studentSkills.filter(
        (ss) => ss.skill === skillAggregate.skill
      ).length;
      return {
        ...skillAggregate,
        masteryScore: skillAggregate.masteryScore / count,
        retentionScore: skillAggregate.retentionScore / count,
      };
    }) as FirestoreSkillAggregate[];

    return { aggregatedStudents, aggregatedSkills };
  } catch (error) {
    console.error("Error aggregating data:", error);
    throw error; // Propagate the error
  }
}

async function updateStudentSkillScore(
  studentSkill: FirestoreStudentSkill,
  answerGrade: number,
  firestoreDb = db
) {
  try {
    // console.log("Current mastery is: " + studentSkill.masteryScore);
    // console.log("Current retention is: " + studentSkill.retentionScore);
    // update the studentSkill
    if (!studentSkill.needToRevise) {
      // updating mastery
      if (answerGrade >= 60) {
        // if the answer was correct
        studentSkill.masteryScore += Math.ceil(
          ((100.0 - studentSkill.masteryScore) * (answerGrade / 100.0)) / 10.0
        ); // return the delta, rounded up
        studentSkill.retentionScore += Math.ceil(
          ((100.0 - studentSkill.retentionScore) * (answerGrade / 100.0)) / 10.0
        );
        // check if gone above limit
        if (studentSkill.masteryScore > 100) {
          studentSkill.masteryScore = 100;
          studentSkill.retentionScore = 100 - 0.01;
        }
      } else {
        // if the answer was incorrect
        studentSkill.masteryScore -= Math.ceil(
          studentSkill.masteryScore / 10.0
        );
        studentSkill.retentionScore -= Math.ceil(
          studentSkill.retentionScore / 10.0
        );
        // check if below 0
        if (studentSkill.masteryScore < 0) {
          studentSkill.masteryScore = 0.01;
          studentSkill.retentionScore = 0;
        }
      }
    } else {
      // updating retention
      if (answerGrade >= 60) {
        // if the answer was correct
        studentSkill.retentionScore += Math.ceil(
          ((100.0 - studentSkill.retentionScore) * (answerGrade / 100.0)) / 10.0
        ); // return the delta, rounded up
        // check if above mastery score
        if (studentSkill.retentionScore > studentSkill.masteryScore) {
          studentSkill.retentionScore = studentSkill.masteryScore - 0.01;
          studentSkill.needToRevise = false;
        } else if (studentSkill.retentionScore > 100) {
          studentSkill.retentionScore = 100;
        } else if (
          studentSkill.retentionScore >
          studentSkill.masteryScore * 0.75
        ) {
          studentSkill.needToRevise = false;
        }
      } else {
        // if the answer was incorrect
        studentSkill.retentionScore -= Math.ceil(
          studentSkill.retentionScore / 10.0
        );
        if (studentSkill.retentionScore < 0) {
          studentSkill.retentionScore = 0;
        }
      }
    }

    const { id, ...studentSkillData } = studentSkill;
    await setDoc(doc(firestoreDb, "studentSkills", id), studentSkillData);
  } catch (error) {
    console.error("Error updating student skill:", error);
    return ""; // Return an empty string in case of an error
  }
}

const getUserFromDb = async ({ id }: { id: string }) => {
  const firestoreDb = db;
  try {
    const docSnapshot = await getDoc(doc(firestoreDb, "users", id));

    if (docSnapshot.exists) {
      return docSnapshot.data() as FirestoreExtendedUser;
    } else {
      throw new Error("No user found");
    }
  } catch (error) {
    console.error(`Error getting user document of id: ${id}`, error);
    return null;
  }
};

// Define a converter for the TutoringSession
const tutoringSessionConverter: FirestoreDataConverter<TutoringSession> = {
  fromFirestore(snapshot: QueryDocumentSnapshot): TutoringSession {
    const data = snapshot.data();
    return {
      ...data,
      // Convert the dateTime field to a JavaScript Date object
      dateTime: data.dateTime.toDate(),
    } as TutoringSession;
  },
  toFirestore(modelObject: TutoringSession): DocumentData {
    return modelObject;
  },
};

async function getTutoringSessionFromDb(id: string, firestoreDb = db) {
  try {
    const docSnapshot = await getDocs(
      collection(firestoreDb, "students", id, "tutoringSessions").withConverter(
        tutoringSessionConverter
      )
    );

    if (docSnapshot.empty) {
      return [];
    } else {
      return docSnapshot.docs.map((doc) => {
        return { [doc.id]: doc.data() } as { [id: string]: TutoringSession };
      });
    }
  } catch (error) {
    console.error(
      `Error getting tutoring session document of id: ${id}`,
      error
    );
    throw error;
  }
}

const insertTutoringSession = async ({
  studentId,
  tutoringSession,
  tutoringSessionId,
}: {
  studentId: string;
  tutoringSession: TutoringSession;
  tutoringSessionId?: string | null;
}) => {
  const firestoreDb = db;

  try {
    if (tutoringSessionId) {
      await setDoc(
        // updating an existing document
        doc(
          firestoreDb,
          "students",
          studentId,
          "tutoringSessions",
          tutoringSessionId
        ),
        tutoringSession,
        { merge: true }
      );
    } else {
      await addDoc(
        // creating a new document
        collection(firestoreDb, "students", studentId, "tutoringSessions"),
        tutoringSession
      );
    }
  } catch (error) {
    console.error(
      `Error ${
        tutoringSessionId
          ? "replacing existing tutoring session with tutoringSessionId " +
            tutoringSessionId
          : "creating new tutoring session"
      } for student ${studentId} with tutoring session ${tutoringSession}`
    );
  }
};

const deleteTutoringSession = async ({
  studentId,
  existingTutoringSessionId,
  mode,
  repeatsFromOriginalSessionId,
}: {
  studentId: string;
  existingTutoringSessionId: string;
  mode: string;
  repeatsFromOriginalSessionId: string;
}) => {
  // Delete the tutoring session from the database
  const firestoreDb = db;
  try {
    if (mode === "single") {
      await deleteDoc(
        doc(
          db,
          "students",
          studentId,
          "tutoringSessions",
          existingTutoringSessionId
        )
      );
      return true;
    } else if (mode === "all") {
      console.log(
        "Deleting all tutoring sessions with repeatsFromOriginalSessionId: " +
          repeatsFromOriginalSessionId
      );
      const q = query(
        collection(firestoreDb, "students", studentId, "tutoringSessions"),
        where(
          "repeatsFromOriginalSessionId",
          "==",
          repeatsFromOriginalSessionId
        )
      );

      // delete documents
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });
      return true;
    }
  } catch (error) {
    console.error(
      `Error deleting tutoring session with id ${existingTutoringSessionId} for student ${studentId}`
    );
    return false;
  }
};

const getParentFromDb = async ({ id, role }: { id: string; role: string }) => {
  // will only ever have a parent OR a student ID being inputted
  // Check if neither inputted
  if (role !== "parent" && role !== "student") {
    throw new Error("Invalid role provided: " + role);
  }

  const firestoreDb = db;

  // studentId being fed in logic
  if (role === "student") {
    try {
      const q = query(
        collection(firestoreDb, "parents"),
        where("childrenShort", "array-contains", id)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const parentsData = {};
        querySnapshot.docs.forEach((doc) => {
          parentsData[doc.id] = doc.data() as FirestoreParent;
        });
        return parentsData;
      } else {
        console.warn("no parent found for student ID: " + id);
        return null;
      }
    } catch (error) {
      console.error(
        `Error getting parent document for student ID ${id}`,
        error
      );
      throw error;
    }
  } else if (role === "parent") {
    // parentId, so just get the parent
    try {
      const parentDoc = await getDoc(doc(firestoreDb, "parents", id));
      if (parentDoc.exists) {
        return parentDoc.data() as FirestoreParent;
      } else {
        console.warn("no parent found for parent ID: " + id);
        return null;
      }
    } catch (error) {
      console.error(`Error getting parent document for parent ID ${id}`, error);
    }
  }
};

const linkUsersInDb = async ({
  userId,
  linkToUserId,
  role,
}: {
  userId: string;
  linkToUserId: string;
  role: string;
}) => {
  try {
    // different logic between linking a parent and a student
    if (role === "student") {
      // first need to add the linkToUserId to the child
      // need to load in the parent user account
      const parentUserDoc = await getDoc(doc(db, "users", linkToUserId));

      // now update the user
      await updateDoc(doc(db, "students", userId), {
        parentsShort: arrayUnion(linkToUserId),
        parentsLong: {
          [`${userId}`]: {
            firstName: parentUserDoc.data().firstName,
            lastName: parentUserDoc.data().lastName,
            email: parentUserDoc.data().email,
            image: parentUserDoc.data().image,
            childAcceptedRequest: true,
            parentAcceptedRequest: false,
          },
        },
      });

      // need to load in the studentUserDoc to update the parentDoc
      const studentUserDoc = await getDoc(doc(db, "users", userId));
      console.log(studentUserDoc.data());

      // then need to add the userId to the parent
      await updateDoc(doc(db, "parents", linkToUserId), {
        childrenShort: arrayUnion(userId),
        childrenLong: {
          [`${userId}`]: {
            firstName: studentUserDoc.data().firstName,
            lastName: studentUserDoc.data().lastName,
            email: studentUserDoc.data().email,
            image: studentUserDoc.data().image,
            subscriptionActive: studentUserDoc.data().subscriptionActive,
            subscriptionName: studentUserDoc.data().subscriptionName,
            childAcceptedRequest: true,
            parentAcceptedRequest: false,
          },
        },
      });

      return true;
    } else if (role === "parent") {
      // logic later
    } else {
      // invalid role
    }
  } catch (error) {
    console.error(
      `Error linking users ${userId} and ${linkToUserId} with role ${role}. Error of: ${error}`
    );
    return false;
  }
};

const handleProfileUpdate = async ({
  id,
  role,
  firstName,
  lastName,
  email,
  yearLevel,
  subjects,
  school,
  interests,
  tutoringGoal,
}: {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  yearLevel: number;
  subjects: string[];
  school: string;
  interests: string[];
  tutoringGoal: string;
}) => {
  // logic for updating the profile
  try {
    // update user regardless of profile type
    await updateDoc(doc(db, "users", id), {
      firstName: firstName,
      lastName: lastName,
      email: email,
    });

    // student logic
    if (role === "student") {
      // update the student account
      await updateDoc(doc(db, "students", id), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        yearLevel: yearLevel,
        subjects: subjects,
        school: school,
        interests: interests,
        tutoringGoal: tutoringGoal,
      });

      // update the parent accounts that might be linked
      // find the parents that have this account in their childrenShort
      const q = query(
        collection(db, "parents"),
        where("childrenShort", "array-contains", id)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach(async (myDoc) => {
          await updateDoc(doc(db, "parents", myDoc.id), {
            [`childrenLong.${id}.firstName`]: firstName,
            [`childrenLong.${id}.lastName`]: lastName,
            [`childrenLong.${id}.email`]: email,
          });
        });
      }

      return true;
    } else if (role === "parent") {
      // update the parent account
      await updateDoc(doc(db, "parents", id), {
        firstName: firstName,
        lastName: lastName,
        email: email,
      });

      // update the student accounts that might be linked
      // find the students that have this account in their parentsShort
      const q = query(
        collection(db, "students"),
        where("parentsShort", "array-contains", id)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach(async (myDoc) => {
          await updateDoc(doc(db, "students", myDoc.id), {
            [`parentsLong.${id}.firstName`]: firstName,
            [`parentsLong.${id}.lastName`]: lastName,
            [`parentsLong.${id}.email`]: email,
          });
        });
      }

      return true;
    }
  } catch (error) {
    console.error("error updating profile: ", error);
    return false;
  }
};

const acceptLinkRequest = async ({
  childId,
  parentId,
}: {
  childId: string;
  parentId: string;
}) => {
  try {
    // already accepted by requester, but we can just update both
    // updating the student doc
    await updateDoc(doc(db, "students", childId), {
      [`parentsLong.${parentId}.childAcceptedRequest`]: true,
      [`parentsLong.${parentId}.parentAcceptedRequest`]: true,
    });

    // the same for the parentDoc
    await updateDoc(doc(db, "parents", parentId), {
      [`childrenLong.${childId}.childAcceptedRequest`]: true,
      [`childrenLong.${childId}.parentAcceptedRequest`]: true,
    });

    return true;
  } catch (error) {
    console.error(
      `Error accepting link request for student ${childId} with parent ${parentId} Error of: ${error}`
    );
    return false;
  }
};

export {
  getSchoolClassSkillFromDB,
  getStudentFromDb,
  getStudentSkillFromDB,
  getStudentSkillFromDBAll,
  getTeacherFromDB,
  getSchoolClassFromDB,
  getAggregatedSkillsForClass,
  getAggregatedStudentsForClass,
  updateStudentSkillScore,
  getAggregatedStudentsAndSkillsForClass,
  getUserFromDb,
  getTutoringSessionFromDb,
  insertTutoringSession,
  deleteTutoringSession,
  getParentFromDb,
  linkUsersInDb,
  acceptLinkRequest,
  handleProfileUpdate,
};
