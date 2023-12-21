import {  FirestoreStudent, 
          FirestoreStudentSkill, 
          SchoolClassSkill, 
          MetricScores, 
          FirestoreTeacher, 
          FirestoreSchoolClass, 
          FirestoreSkillAggregate, 
          FirestoreStudentAggregate } from './interfaces';

import { db } from "../firebase";
import { Firestore } from 'firebase-admin/firestore';
import { collection, getDocs, query, limit, where, doc, setDoc} from "firebase/firestore";
 
// connect to the astraDb instance

async function getSchoolClassSkillFromDB(schoolClass : string, skill : string, db) {
  const q = query(collection(db, 'schoolClassSkills'), where('schoolClass', '==', schoolClass), where('skill', '==', skill), limit(1));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as SchoolClassSkill;
      } else {
        throw new Error('No schoolClassSkill found');
      }
    }
    ).catch((error) => {
      console.log(`Error getting skill document of schoolClass ${schoolClass} and skill ${skill}`, error);
      throw(error);
    });
}

async function getStudentFromDB(email : string, db) {
  const q = query(collection(db, 'students'), where('email', '==', email), limit(1));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as FirestoreStudent;
      } else {
        throw new Error('No student found');
      };
    }
    ).catch((error) => {
      console.log(`Error getting student document of email ${email}`, error);
      throw(error);
    });
}

async function getStudentSkillFromDB(email : string, skill : string, db) {
  const q = query(collection(db, 'studentSkills'), where('email', '==', email), where('skill', '==', skill), limit(1));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as FirestoreStudentSkill;
      } else {
        throw new Error('No studentSkill found');
      };
    }
    ).catch((error) => {
      console.log(`Error getting studentSkill document of email ${email} and skill ${skill}`, error);
      throw(error);
    }
    );
}

async function getStudentSkillFromDBAll(email : string, db) {
  const q = query(collection(db, 'studentSkills'), where('email', '==', email));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => doc.data()) as FirestoreStudentSkill[];
      } else {
        throw new Error('No studentSkill found');
      };
    }
    ).catch((error) => {
      console.log(`Error getting all studentSkill documents of email ${email}`, error);
      throw(error);
    }
    );
  
}

async function getTeacherFromDB(email : string, db) {
  const q = query(collection(db, 'teachers'), where('email', '==', email), limit(1));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as FirestoreTeacher;
      } else {
        throw new Error('No teacher found');
      };
    }
    ).catch((error) => {
      console.log(`Error getting teacher document of email ${email}`, error);
      throw(error);
    }
    );
}

async function getSchoolClassFromDB(schoolClassName : string, db) {
  const q = query(collection(db, 'schoolClasses'), where('name', '==', schoolClassName), limit(1));
  getDocs(q).
    then((querySnapshot) => {
      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as FirestoreSchoolClass;
      } else {
        throw new Error('No schoolClass found');
      };
    })
}

// this function aggregates skill values for a class - so we should be able to feed in the class and do some aggregation over.
async function getAggregatedSkillsForClass(schoolClass: string) {
  try {
    // get the list of student skills for this class
    const studentSkillsQuery = query(collection(db, 'studentSkills'), where('schoolClass', '==', schoolClass));
    const studentSkills = (await getDocs(studentSkillsQuery)).docs.map(doc => doc.data()) as FirestoreStudentSkill[];

    // use a map
    const skillMap: Record<string, FirestoreSkillAggregate> = {};

    studentSkills.forEach((studentSkill) => {
      const { skill, schoolClass, masteryScore, retentionScore, needToRevise, areDependenciesMet } = studentSkill;
  
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
    return Object.values(skillMap).map(skillAggregate => {
      const count = studentSkills.filter(ss => ss.skill === skillAggregate.skill).length;
      return {
        ...skillAggregate,
        masteryScore: skillAggregate.masteryScore / count,
        retentionScore: skillAggregate.retentionScore / count,
      };
    });

  } catch (error) {
    console.error('Error aggregating skills data:', error);
    throw error; // Propagate the error
  }
}

// Gets the aggregated skills for each student in a class
async function getAggregatedStudentsForClass(schoolClass : string, db) {
  // 
  const studentSkillsQuery = query(collection(db, 'studentSkills'), where('schoolClass', '==', schoolClass));
  const studentSkills = (await getDocs(studentSkillsQuery)).docs.map(doc => doc.data()) as FirestoreStudentSkill[];
  
  const studentMap: Record<string, FirestoreStudentAggregate> = {};

  studentSkills.forEach((studentSkill) => {
    const { firstName, lastName, email, schoolClass, masteryScore, retentionScore, needToRevise } = studentSkill;
    const fullName = `${firstName} ${lastName}`;

    if (!studentMap[email]) {
      studentMap[email] = {
        fullName,
        email,
        className: schoolClass,
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
  return Object.values(studentMap).map(studentAggregate => {
    const count = studentSkills.filter(ss => ss.email === studentAggregate.email).length;
    return {
      ...studentAggregate,
      masteryScore: studentAggregate.masteryScore / count,
      retentionScore: studentAggregate.retentionScore / count,
    };
  });
}

async function updateStudentSkillScore(email : string, skill : string, db, answerGrade : number) {
    try {
      // need to get the unique ID of the studentSkill first
      const studentSkillQuery = query(collection(db, 'studentSkills'), where('email', '==', email), where('skill', '==', skill), limit(1));
      const studentSkill = (await getDocs(studentSkillQuery)).docs[0];

      // update the studentSkill
      if (!studentSkill.data().needToRevise) {
        // updating mastery
        if (answerGrade >= 60) { // if the answer was correct
          studentSkill.data().masteryScore += (100.0 - studentSkill.data().masteryScore)*(answerGrade/100.0)/10.0; // return the delta, rounded up
        } else { // if the answer was incorrect
          studentSkill.data().masteryScore -= (studentSkill.data().masteryScore)/10.0
        }
      } else {
        // updating retention
        if (answerGrade >= 60) { // if the answer was correct
          studentSkill.data().retentionScore += (100.0 - studentSkill.data().retentionScore)*(answerGrade/100.0)/10.0; // return the delta, rounded up
        } else { // if the answer was incorrect
          studentSkill.data().retentionScore -= (studentSkill.data().retentionScore)/10.0
        }
      }

      await setDoc(doc(db, 'studentSkills', studentSkill.id), studentSkill.data());
    } catch (error) {
      console.error('Error updating student skill:', error);
      return ''; // Return an empty string in case of an error
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
}


