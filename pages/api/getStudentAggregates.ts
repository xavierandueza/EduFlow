import type { NextApiRequest, NextApiResponse } from 'next';
import { getStudentAggregatesForClassFromDB } from '../../app/utils/databaseFunctions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log("Getting studentSkill from the handler function")
    console.log("req.body is: ");
    console.log(req.body);

    const { _id } = req.body;
    const result = await getStudentAggregatesForClassFromDB(_id);

    console.log("Student aggregates are: ");
    console.log(result);
    
    res.status(200).json(result);
}