import {
  FirestoreStudent,
  FirestoreStudentSkill,
  SchoolClassSkill,
  MetricScores,
  FirestoreTeacher,
  FirestoreSchoolClass,
  FirestoreSkillAggregate,
  FirestoreStudentAggregate,
} from "./interfaces";

import { db } from "../firebase";
import { Firestore } from "firebase-admin/firestore";
import {
  collection,
  getDoc,
  getDocs,
  query,
  limit,
  where,
  doc,
  setDoc,
} from "firebase/firestore";


async function getSchoolClassSkillFromDB(id?: string, schoolClass? : string, skill? : string, firestoreDb = db) {
  try {
    if (id) {
      const docSnapshot = await getDoc(doc(firestoreDb, "schoolClassSkills", id));

      if (docSnapshot.exists) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as SchoolClassSkill;
      } else {
        throw new Error("No schoolClassSkill found");
      }
    }
    else if (schoolClass && skill) {
      const q = query(
        collection(firestoreDb, "schoolClassSkills"),
        where("schoolClass", "==", schoolClass),
        where("skill", "==", skill),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as SchoolClassSkill;
      } else {
        throw new Error("No schoolClassSkill found");
      }
    }
    else {
      throw new Error("Cannot find unique schoolClassSkill with inputted data");
    }
  } catch (error) {
    console.error(`Error getting studentSkill documents for id: ${id}`, error);
    throw error;
  }
}

async function getStudentFromDB(id?: string, email?: string, firestoreDb = db) {
  try {
    if (id) {
      const docSnapshot = await getDoc(doc(firestoreDb, "students", id));

      if (docSnapshot.exists) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as FirestoreStudent;
      } else {
        throw new Error("No student found");
      }
    } else if (email) {
      const q = query(
        collection(firestoreDb, "students"),
        where("email", "==", email),
        limit(1),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as FirestoreStudent;
      } else {
        throw new Error("No student found");
      }
    } else {
      throw new Error("No student found");
    }
  } catch (error) {
    console.log(
      `Error getting student document of id: ${id} OR email ${email}`,
      error,
    );
    throw error;
  }
}

async function getStudentSkillFromDB(
  id?: string,
  email?: string,
  skill?: string,
  firestoreDb = db,
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
        limit(1),
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
    where("email", "==", email),
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
      error,
    );
    throw error;
  }
}

async function getTeacherFromDB(email: string, firestoreDb = db) {
  const q = query(
    collection(firestoreDb, "teachers"),
    where("email", "==", email),
    limit(1),
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
    limit(1),
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
  firestoreDb = db,
) {
  try {
    // get the list of student skills for this class
    const studentSkillsQuery = query(
      collection(firestoreDb, "studentSkills"),
      where("schoolClassID", "==", schoolClassId),
    );
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery)
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
        (ss) => ss.skill === skillAggregate.skill,
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
  firestoreDb = db,
) {
  try {
    const studentSkillsQuery = query(
      collection(firestoreDb, "studentSkills"),
      where("schoolClassID", "==", schoolClassId),
    );
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery)
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
        (ss) => ss.email === studentAggregate.email,
      ).length;
      return {
        ...studentAggregate,
        masteryScore: studentAggregate.masteryScore / count,
        retentionScore: studentAggregate.retentionScore / count,
      };
    }) as FirestoreStudentAggregate[];
  }  catch (error) {
    console.error("Error aggregating students data:", error);
    throw error; // Propagate the error
  }
}

async function getAggregatedStudentsAndSkillsForClass(schoolClassId : string, firestoreDb = db) {
  const studentSkillsQuery = query(
    collection(firestoreDb, "studentSkills"),
    where("schoolClassID", "==", schoolClassId)
  )
  try {
    const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery)

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
    const aggregatedStudents = Object.values(studentMap).map((studentAggregate) => {
      const count = studentSkills.filter(
        (ss) => ss.email === studentAggregate.email,
      ).length;
      return {
        ...studentAggregate,
        masteryScore: studentAggregate.masteryScore / count,
        retentionScore: studentAggregate.retentionScore / count,
      };
    }) as FirestoreStudentAggregate[];

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
        (ss) => ss.skill === skillAggregate.skill,
      ).length;
      return {
        ...skillAggregate,
        masteryScore: skillAggregate.masteryScore / count,
        retentionScore: skillAggregate.retentionScore / count,
      };
    }) as FirestoreSkillAggregate[];

    return {aggregatedStudents, aggregatedSkills}
  } catch (error) {
    console.error("Error aggregating data:", error);
    throw error; // Propagate the error
  }
}

async function updateStudentSkillScore(
  studentSkill: FirestoreStudentSkill,
  answerGrade: number,
  firestoreDb = db,
) {
  try {
    // console.log("Current mastery is: " + studentSkill.masteryScore);
    // console.log("Current retention is: " + studentSkill.retentionScore);
    // update the studentSkill
    if (!studentSkill.needToRevise) {
      // updating mastery
      if (answerGrade >= 60) {
        // if the answer was correct
        studentSkill.masteryScore +=
          Math.ceil(((100.0 - studentSkill.masteryScore) * (answerGrade / 100.0)) / 10.0); // return the delta, rounded up
        studentSkill.retentionScore += 
          Math.ceil(((100.0 - studentSkill.retentionScore) * (answerGrade / 100.0)) / 10.0);
          // check if gone above limit
          if (studentSkill.masteryScore > 100) {
            studentSkill.masteryScore = 100;
            studentSkill.retentionScore = 100-0.01;
          }
      } else {
        // if the answer was incorrect
        studentSkill.masteryScore -= Math.ceil(studentSkill.masteryScore / 10.0);
        studentSkill.retentionScore -= Math.ceil(studentSkill.retentionScore / 10.0);
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
        studentSkill.retentionScore +=
          Math.ceil(((100.0 - studentSkill.retentionScore) * (answerGrade / 100.0)) /
          10.0); // return the delta, rounded up
        // check if above mastery score
        if (studentSkill.retentionScore > studentSkill.masteryScore) {
          studentSkill.retentionScore = studentSkill.masteryScore - 0.01; 
          studentSkill.needToRevise = false;
        } else if (studentSkill.retentionScore > 100) {
          studentSkill.retentionScore = 100;
        } else if (studentSkill.retentionScore > studentSkill.masteryScore * 0.75) {
          studentSkill.needToRevise = false;
        }
      } else {
        // if the answer was incorrect
        studentSkill.retentionScore -= Math.ceil(studentSkill.retentionScore / 10.0);
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

export {
  getSchoolClassSkillFromDB,
  getStudentFromDB,
  getStudentSkillFromDB,
  getStudentSkillFromDBAll,
  getTeacherFromDB,
  getSchoolClassFromDB,
  getAggregatedSkillsForClass,
  getAggregatedStudentsForClass,
  updateStudentSkillScore,
  getAggregatedStudentsAndSkillsForClass,
};
