import type { NextApiRequest, NextApiResponse } from 'next';
import {AstraDB} from "@datastax/astra-db-ts";
import { getSkillFromDB, getStudentSkillFromDB } from '../../app/utils/databaseFunctions';

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

type Dependencies = {
    areDependenciesValid: boolean;
    invalidDependencies: string[];
    invalidDependenciesScores: number[];
};

async function checkDependencies(email: string, skill : string) {
    // get the student skill
    console.log(`skill is: ${skill}`);
    console.log(`email is: ${email}`);
    const returnedSkill = await getSkillFromDB(skill, astraDb);
    console.log(returnedSkill);
    // console.log(returnedSkill);
    // if the length of the student dependencies is 0, then return the JSON object
    if (returnedSkill.dependencies.length === 0) {
        // console.log("no dependencies to check")
        return {
            areDependenciesValid: true,
            invalidDependencies: [],
            invalidDependenciesScores: [],
        };
    }
    else {
        // console.log("Checking dependencies")
        // create the initial json object
        const dependencies: Dependencies = {
            areDependenciesValid: true,
            invalidDependencies: [],
            invalidDependenciesScores: [],
        };
        // need to check all of the dependencies
        for (const dependency of returnedSkill.dependencies) {
            // get the dependency from the DB
            const dependencyStudentSkill = await getStudentSkillFromDB(email, dependency, astraDb);
            // check if the dependency is valid
            if (dependencyStudentSkill.mastery_score < 40.0) {
                /* console.log(`Invalid dependency: ${dependency}
                With mastery score of: ${dependencyStudentSkill.mastery_score}`) */
                // modify the inital json object
                dependencies.areDependenciesValid = false;
                dependencies.invalidDependencies.push(dependency);
                dependencies.invalidDependenciesScores.push(dependencyStudentSkill.mastery_score);
            }
        }
        // return the json object
        // console.log(dependencies)
        return dependencies;
    }
} 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log("Checking dependencies in the handler function")

    const { email, skill } = req.body;

    const result = await checkDependencies(email, skill);
    res.status(200).json(result);
}