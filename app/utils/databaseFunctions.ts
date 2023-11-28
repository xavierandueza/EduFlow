import { AstraDB } from "@datastax/astra-db-ts";
import { Student, StudentSkill, Skill, MetricScores, Teacher, SchoolClass, SkillAggregate, StudentAggregate } from './interfaces';

// connect to the astraDb instance
const localAstraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

async function getSkillFromDB(skill : string, astraDb : AstraDB = localAstraDb) {
  try {
    const collection = await astraDb.collection('skills_vec');
    const dbResponse = await collection.findOne({ skill: skill }) as Skill;
    if (!dbResponse) {
      throw new Error('No skill found');
    }
    return dbResponse;
  } catch (error) {
    console.error('Error fetching skill:', error);
    throw error; // Propagate the error
  }
}

async function getStudentFromDB(email : string, astraDb : AstraDB = localAstraDb) {
  try {
    const collection = await astraDb.collection('students_vec');
    const dbResponse = await collection.findOne({ email_address: email } as Student);
    if (!dbResponse) {
      throw new Error('No Student found');
    }
    return dbResponse;
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error; // Propagate the error
  }
}

async function getStudentSkillFromDB(email : string, skill : string, astraDb : AstraDB = localAstraDb) {
  try {
      const collection = await astraDb.collection('student_skills_vec');
      const dbResponse = await collection.findOne({ email_address: email, skill: skill }) as StudentSkill;
      if (!dbResponse) {
        throw new Error('No studentSkill found');
      }
      return dbResponse;
    } catch (error) {
      console.error('Error fetching studentSkill:', error);
      throw error; // Propagate the error
    }
}

async function getStudentSkillFromDBAll(email : string, astraDb : AstraDB = localAstraDb) {
  try {
    const collection = await astraDb.collection('student_skills_vec');
    const cursor = await collection.find({ email_address: email});
    const dbResponse = await cursor.toArray() as StudentSkill[];
    if (!dbResponse) {
      throw new Error('No studentSkills found');
    }
    return dbResponse;
  } catch (error) {
    console.error('Error fetching studentSkills:', error);
    throw error; // Propagate the error
  }
}

async function getTeacherFromDB(email : string, astraDb : AstraDB = localAstraDb) {
  try {
    const collection = await astraDb.collection('teachers_vec');
    const dbResponse = await collection.findOne({ email_address: email}) as Teacher;
    if (!dbResponse) {
      throw new Error('No Teacher found');
    }
    return dbResponse;
  } catch (error) {
    console.error('Error fetching Teacher:', error);
    throw error; // Propagate the error
  }
}

async function getSchoolClassFromDB(schoolClassName : string, astraDb : AstraDB = localAstraDb) {
  try {
    const collection = await astraDb.collection('school_classes_vec');
    const dbResponse = await collection.findOne({ school_class_name: schoolClassName}) as SchoolClass;
    if (!dbResponse) {
      throw new Error('No schoolClass found');
    }
    return dbResponse;
  } catch (error) {
    console.error('Error fetching schoolClass:', error);
    throw error; // Propagate the error
  }
}

async function getSchoolClassFromDBAll(schoolClassNameList : string[], astraDb : AstraDB = localAstraDb) {
  try {
    let schoolClassList : SchoolClass[] = []; // define as empty and append to if there are any classes
    if (schoolClassNameList.length > 0) {
      // get the schoolClasses one-by-one and append
      const collection = await astraDb.collection('school_classes_vec');
      for (const schoolClassName of schoolClassNameList) {
        const dbResponse = await collection.findOne({ school_class_name: schoolClassName}) as SchoolClass;
        if (!dbResponse) {
          throw new Error('No schoolClass found');
        }
        schoolClassList.push(dbResponse);
      }
    }
    return schoolClassList;
  } catch (error) {
    console.error('Error fetching schoolClasses:', error);
    throw error; // Propagate the error
  }
}

function aggregateSkillsData(skills: StudentSkill[]): SkillAggregate[] {
  try {
    // get the list of unique skills from the studentSkills
    const uniqueSkills = Array.from(new Set(skills.map((skill) => skill.skill)));
    const schoolClassName = skills[0].school_class_name;

    // get the total number of students, aka the unique emails
    const studentCount = Array.from(new Set(skills.map((skill) => skill.email_address))).length;

    // create an empty array of SkillAggregate objects
    let skillAggregates : SkillAggregate[] = [];

    // for each unique skill, aggregate the data
    for (const skill of uniqueSkills) {
      // get the list of studentSkills for this skill
      const skillStudentSkills = skills.filter((studentSkill) => studentSkill.skill === skill);
      // loop over the filtered list
      let masteryScoreTotal = 0;
      let retentionScoreTotal = 0;
      let noStudentsNotMetDependencies = 0;
      let noStudentsToRevise = 0;
      for (const skillStudentSkill of skillStudentSkills) {
        masteryScoreTotal += skillStudentSkill.mastery_score;
        retentionScoreTotal += skillStudentSkill.retention_score;
        if (skillStudentSkill.dependencies_met === false) {
          noStudentsNotMetDependencies += 1;
        }
        if (skillStudentSkill.need_to_revise) {
          noStudentsToRevise += 1;
        }
      }

      // calculate the averages
      skillAggregates.push({
        skill : skill,
        school_class_name : schoolClassName,
        mastery_score : masteryScoreTotal/studentCount,
        retention_score : retentionScoreTotal/studentCount,
        no_students_not_met_dependencies : noStudentsNotMetDependencies,
        no_students_to_revise : noStudentsToRevise,
      });
    }
    // return the array of SkillAggregate objects
    console.log(skillAggregates);
    return skillAggregates;
  } catch (error) {
    console.error('Error aggregating skills data:', error);
    throw error; // Propagate the error
  }
}

async function getSkillsAggregateForClassFromDB(_id : string, astraDb : AstraDB = localAstraDb) {
  try {
    // Get the class first
    const studentClassCollection = await astraDb.collection('school_classes_vec');
    const studentClass = await studentClassCollection.findOne({ _id: _id}); 
    
    // Now go ahead and get the skills from the class
    const collection = await astraDb.collection('student_skills_vec');
    const cursor = await collection.find({ school_class_name: studentClass.school_class_name});
    const studentSkills = await cursor.toArray() as StudentSkill[];
    
    // Now aggregate the skills data
    const aggregatedSkills = aggregateSkillsData(studentSkills);
    // console.log(aggregatedSkills)
    return aggregatedSkills;
  } catch (error) {
    console.error('Error aggregating skills for class:', error);
    throw error; // Propagate the error
  }
}

async function aggregateStudentsData(skills: StudentSkill[]) {
  try {
    // get the list of unique skills from the studentSkills
    const uniqueStudents = Array.from(new Set(skills.map((skill) => skill.email_address)));
    const schoolClassName = skills[0].school_class_name;

    // get the total number of skills, aka the unique skills
    const skillsCount = Array.from(new Set(skills.map((skill) => skill.skill))).length;

    // create an empty array of SkillAggregate objects
    let studentAggregates : StudentAggregate[] = [];

    // for each unique skill, aggregate the data
    for (const email_address of uniqueStudents) {
      // get the list of studentSkills for this skill
      const studentStudentSkills = skills.filter((studentSkill) => studentSkill.email_address === email_address);
      // loop over the filtered list
      let masteryScoreTotal = 0;
      let retentionScoreTotal = 0;
      let noSkillsToRevise = 0;
      for (const studentStudentSkill of studentStudentSkills) {
        masteryScoreTotal += studentStudentSkill.mastery_score;
        retentionScoreTotal += studentStudentSkill.retention_score;
        if (studentStudentSkill.need_to_revise) {
          noSkillsToRevise += 1;
        }
      }
      
      // get the student from the db so I can get their details
      const student = await getStudentFromDB(email_address);

      // calculate the averages
      studentAggregates.push({
        full_name : student.first_name + ' ' + student.last_name,
        email_address : student.email_address,
        school_class_name : schoolClassName,
        mastery_score : masteryScoreTotal/skillsCount,
        retention_score : retentionScoreTotal/skillsCount,
        skills_to_revise : noSkillsToRevise,
      });
    }
    // return the array of SkillAggregate objects
    // console.log(skillAggregates);
    return studentAggregates;
  } catch (error) {
    console.error('Error aggregating student data:', error);
    throw error; // Propagate the error
  }
}

async function getStudentAggregatesForClassFromDB(_id : string, astraDb : AstraDB = localAstraDb) {
  try {
    // Get the class first
    const studentClassCollection = await astraDb.collection('school_classes_vec');
    const studentClass = await studentClassCollection.findOne({ _id: _id}); 
    
    // Now go ahead and get the students from the class
    const collection = await astraDb.collection('student_skills_vec');
    const cursor = await collection.find({ school_class_name: studentClass.school_class_name});
    const studentSkills = await cursor.toArray() as StudentSkill[];
    
    // Now aggregate the student data
    const aggregatedStudents = await aggregateStudentsData(studentSkills);
    // console.log(aggregatedStudents)
    return aggregatedStudents;
  } catch (error) {
    console.error('Error aggregating students for class:', error);
    throw error; // Propagate the error
  }
}

async function updateNeedToReviseFlag(email: string, skill: string, needToRevise: boolean, decayValue : number, astraDb : AstraDB = localAstraDb) {
    try {
      if (needToRevise) { // we have just finished our revision, so halve the decay value
         decayValue = decayValue/2.0;
      }
      // still missing the ability to update the 
      const collection = await astraDb.collection('student_skills_vec');
      const dbResponse = await collection.updateOne({ email_address: email, skill: skill }, {"$set" : {need_to_revise : !needToRevise, decay_value : decayValue}});
      console.log('Updated need to revise flag.')
      return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
      console.error('Error updating need to revise flag:', error);
      return ''; // Return an empty string in case of an error
    }
}

async function updateStudentSkillScores(email : string, skill : string, masteryScore : number, retentionScore : number, needToRevise : boolean, decayValue : number, answerGrade : number, astraDb : AstraDB = localAstraDb) {
    if (masteryScore === null) {
      masteryScore = 0;
    } 
    if (retentionScore === null) {
      retentionScore = 0;
    }
    try {
      const collection = await astraDb.collection('student_skills_vec');
      // console.log('About to calculate new metric scores.');
      const newMetricScores = calculateNewMetricScores(email, skill, masteryScore, retentionScore, answerGrade, needToRevise, decayValue, astraDb);
      // console.log('New metric scores are: ' + newMetricScores.mastery_score + ' and ' + newMetricScores.retention_score);
      const dbResponse = await collection.updateOne({ email_address: email, skill: skill }, {"$set" : newMetricScores});
      // console.log('Updated student skill scores.')
      return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
      console.error('Error updating student skill:', error);
      return ''; // Return an empty string in case of an error
    }
  }

function calculateMetricScoreDelta(masteryScore : number, retentionScore: number, answerGrade : number, needToRevise : boolean) {
    // console.log('Calculating metric score delta');
    // console.log('Mastery score is: ' + masteryScore);
    // console.log('Retention score is: ' + retentionScore);
    // console.log('Answer grade is: ' + answerGrade);
    // console.log('Type of answer grade is: ' + typeof(answerGrade));
    // console.log('Need to revise is: ' + needToRevise);
    
    let relevantScore: number;
  
    if (needToRevise) { // calculate the delta from the retentionScore, not the mastery score
      relevantScore = retentionScore;
    } else {
      relevantScore = masteryScore;
    }
  
    if (answerGrade >= 60) { // if the answer was correct
      return (100.0 - relevantScore)*(answerGrade/100.0)/10.0; // return the delta, rounded up
    } else { // if the answer was incorrect
      return -(relevantScore)/10.0
    }
}

function calculateNewMetricScores(
    email: string,
    skill: string,
    masteryScore: number,
    retentionScore: number,
    answerGrade: number,
    needToRevise: boolean,
    decayValue: number,
    astraDb: AstraDB
  ): MetricScores {
    // console.log('About to calculate new metric score delta.');
    const metricScoreDelta = calculateMetricScoreDelta(masteryScore, retentionScore, answerGrade, needToRevise);
    // console.log('Metric score delta is: ' + metricScoreDelta);
    const updatedMasteryScore = Math.max(masteryScore + metricScoreDelta, 0);
    const updatedRetentionScore = Math.max(retentionScore + metricScoreDelta, 0);
  
    if (!needToRevise) {
      return {
        mastery_score: updatedMasteryScore,
        retention_score: updatedRetentionScore
      };
    } else {
      if (updatedRetentionScore > masteryScore) {
        // Flip the needToRevise flag
        const updateNeedToRevise = updateNeedToReviseFlag(email, skill, needToRevise, decayValue, astraDb);
  
        return {
          mastery_score : masteryScore,
          retention_score: masteryScore
        };
      }
  
      return {
        mastery_score : masteryScore,
        retention_score: updatedRetentionScore
      };
    }
}

export {
    getSkillFromDB,
    getStudentFromDB,
    getStudentSkillFromDB,
    getStudentSkillFromDBAll,
    getTeacherFromDB,
    getSchoolClassFromDB,
    getSchoolClassFromDBAll,
    getSkillsAggregateForClassFromDB,
    getStudentAggregatesForClassFromDB,
    updateNeedToReviseFlag,
    updateStudentSkillScores
}


