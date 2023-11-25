import type { NextApiRequest, NextApiResponse } from 'next';
import {AstraDB} from "@datastax/astra-db-ts";
import { getStudentSkillFromDB } from '../../app/utils/databaseFunctions';

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

type Dependencies = {
    areDependenciesValid: boolean;
    invalidDependencies: string[];
    invalidDependenciesScores: number[];
};

async function checkDependencies(email: string, skill : string) {
    // get the student skill
    const studentSkill = await getStudentSkillFromDB(email, skill, astraDb);
    console.log(studentSkill);
    console.log(studentSkill);
    // if the length of the student dependencies is 0, then return the JSON object
    if (studentSkill.dependencies.length === 0) {
        console.log("no dependencies to check")
        return {
            areDependenciesValid: true,
            invalidDependencies: [],
            invalidDependenciesScores: [],
        };
    }
    else {
        console.log("Checking dependencies")
        // create the initial json object
        const dependencies: Dependencies = {
            areDependenciesValid: true,
            invalidDependencies: [],
            invalidDependenciesScores: [],
        };
        // need to check all of the dependencies
        for (const dependency of studentSkill.dependencies) {
            // get the dependency from the DB
            const dependencySkill = await getStudentSkillFromDB(email, dependency, astraDb);
            // check if the dependency is valid
            if (dependencySkill.mastery_score < 40.0) {
                console.log(`Invalid dependency: ${dependency}
                With mastery score of: ${dependencySkill.mastery_score}`)
                // modify the inital json object
                dependencies.areDependenciesValid = false;
                dependencies.invalidDependencies.push(dependency);
                dependencies.invalidDependenciesScores.push(dependencySkill.mastery_score);
            }
        }
        // return the json object
        console.log(dependencies)
        return dependencies;
    }
} 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Checking dependencies in the handler function")

    const { email, skill } = req.body;

    const result = await checkDependencies(email, skill);
    res.status(200).json(result);
}