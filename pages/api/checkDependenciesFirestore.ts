import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../app/firebase";
import {
  getSchoolClassSkillFromDB,
  getStudentSkillFromDB,
} from "../../app/utils/databaseFunctionsFirestore";
import { FirestoreStudentSkill } from "../../app/utils/interfaces";

type Dependencies = {
  areDependenciesValid: boolean;
  invalidDependencies: string[];
  invalidDependenciesScores: number[];
};

async function checkDependencies(studentSkill: FirestoreStudentSkill) {
  const returnedSchoolClassSkill = await getSchoolClassSkillFromDB(
    studentSkill.skillID,
  );

  // loop over dependencies if they exist
  if (returnedSchoolClassSkill.dependencies.length === 0) {
    // console.log("no dependencies to check")
    return {
      areDependenciesValid: true,
      invalidDependencies: [],
      invalidDependenciesScores: [],
    };
  } else {
    // Check the dependencies, Setting default values
    const dependencies: Dependencies = {
      areDependenciesValid: true,
      invalidDependencies: [],
      invalidDependenciesScores: [],
    };

    for (const dependency of returnedSchoolClassSkill.dependencies) {
      // get the dependent student skill score
      const dependencyStudentSkill = await getStudentSkillFromDB(
        null,
        studentSkill.email,
        dependency,
      );

      // check if the dependency is valid
      if (dependencyStudentSkill.masteryScore < 40.0) {
        // modify the inital json object
        dependencies.areDependenciesValid = false;
        dependencies.invalidDependencies.push(dependency);
        dependencies.invalidDependenciesScores.push(
          dependencyStudentSkill.masteryScore,
        );
      }
    }

    return dependencies;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // console.log("Checking dependencies in the handler function")

  const { studentSkill } = req.body;

  const result = await checkDependencies(studentSkill);
  res.status(200).json(result);
}
