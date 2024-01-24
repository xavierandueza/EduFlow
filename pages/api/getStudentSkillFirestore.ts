import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../app/firebase";
import { getStudentSkillFromDb } from "../../app/utils/databaseFunctionsFirestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log("Getting studentSkill from the handler function")

  const { studentSkillId } = req.body;
  // console.log("The studentSkillId is: " + studentSkillId)
  const result = "hello";
  // const result = await getStudentSkillFromDb({studentId: });
  res.status(200).json(result);
}
