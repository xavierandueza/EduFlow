import { AstraDB } from "@datastax/astra-db-ts";

// connect to the astraDb instance
const localAstraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

async function getSkillFromDB(skill : string, astraDb : AstraDB = localAstraDb) {
    try {
      const collection = await astraDb.collection('skills_vec');
      const dbResponse = await collection.findOne({ skill: skill });
      return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
      console.error('Error fetching skill:', error);
      return ''; // Return an empty string in case of an error
    }
}

async function getStudentFromDB(email : string, astraDb : AstraDB = localAstraDb) {
    try {
      const collection = await astraDb.collection('students_vec');
      const dbResponse = await collection.findOne({ email_address: email });
      return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
      console.error('Error fetching student:', error);
      return ''; // Return an empty string in case of an error
    }
}

async function getStudentSkillFromDB(email : string, skill : string, astraDb : AstraDB = localAstraDb) {
    try {
        const collection = await astraDb.collection('student_skills_vec');
        const dbResponse = await collection.findOne({ email_address: email, skill: skill });
        return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
        console.error('Error fetching student skill:', error);
        return ''; // Return an empty string in case of an error
    }
}

async function getStudentSkillFromDBAll(email : string, astraDb : AstraDB = localAstraDb) {
  try {
      const collection = await astraDb.collection('student_skills_vec');
      const cursor = await collection.find({ email_address: email});
      const studentSkillsAll = await cursor.toArray();
      console.log('Logging all student skills:')
      console.log(studentSkillsAll)
      return studentSkillsAll || ''; // Return the response or an empty string if no skill is found
  } catch (error) {
      console.error('Error fetching all student skills:', error);
      return ''; // Return an empty string in case of an error
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
      console.log('About to calculate new metric scores.');
      const newMetricScores = calculateNewMetricScores(email, skill, masteryScore, retentionScore, answerGrade, needToRevise, decayValue, astraDb);
      console.log('New metric scores are: ' + newMetricScores.mastery_score + ' and ' + newMetricScores.retention_score);
      const dbResponse = await collection.updateOne({ email_address: email, skill: skill }, {"$set" : newMetricScores});
      console.log('Updated student skill scores.')
      return dbResponse || ''; // Return the response or an empty string if no skill is found
    } catch (error) {
      console.error('Error updating student skill:', error);
      return ''; // Return an empty string in case of an error
    }
  }

type MetricScores = {
    mastery_score: number;
    retention_score: number;
};

function calculateMetricScoreDelta(masteryScore : number, retentionScore: number, answerGrade : number, needToRevise : boolean) {
    console.log('Calculating metric score delta');
    console.log('Mastery score is: ' + masteryScore);
    console.log('Retention score is: ' + retentionScore);
    console.log('Answer grade is: ' + answerGrade);
    console.log('Type of answer grade is: ' + typeof(answerGrade));
    console.log('Need to revise is: ' + needToRevise);
    
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
    console.log('About to calculate new metric score delta.');
    const metricScoreDelta = calculateMetricScoreDelta(masteryScore, retentionScore, answerGrade, needToRevise);
    console.log('Metric score delta is: ' + metricScoreDelta);
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
    updateNeedToReviseFlag,
    updateStudentSkillScores
}


