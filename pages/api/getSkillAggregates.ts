import type { NextApiRequest, NextApiResponse } from 'next';
import { getSkillsAggregateForClassFromDB } from '../../app/utils/databaseFunctions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log("Getting studentSkill from the handler function")

    const { _id } = req.body;
    const result = await getSkillsAggregateForClassFromDB(_id);

    // console.log("Skills aggregate is: ");
    // console.log(result);

    res.status(200).json(result);
}