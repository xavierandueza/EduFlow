import type { NextApiRequest, NextApiResponse } from 'next';
import { getAggregatedStudentsForClass } from '../../app/utils/databaseFunctionsFirestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log("Getting studentSkill from the handler function")

    const { schoolClassId } = req.body;
    console.log("The schoolClassId is: " + schoolClassId)
    
    const result = await getAggregatedStudentsForClass(schoolClassId);
    console.log("printing aggregated students: ")
    console.log(result)

    // console.log("Skills aggregate is: ");
    // console.log(result);

    res.status(200).json(result);
}