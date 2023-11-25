import type { NextApiRequest, NextApiResponse } from 'next';
import {AstraDB} from "@datastax/astra-db-ts";
import { getStudentSkillFromDB } from '../../app/utils/databaseFunctions';

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ID, process.env.ASTRA_DB_REGION, process.env.ASTRA_DB_NAMESPACE);

type Score = {
    masteryScore: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Retrieving mastery score in handler")

    const { email, skill } = req.body;

    const studentSkill = await getStudentSkillFromDB(email, skill, astraDb);
    console.log(studentSkill);
    console.log
    const result : Score = {
        masteryScore: studentSkill.mastery_score
    }
    res.status(200).json(result);
}

