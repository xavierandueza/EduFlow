import type { NextApiRequest, NextApiResponse } from "next";
import {
  getSchoolClassFromDBAll,
  getTeacherFromDB,
} from "../../app/utils/databaseFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // console.log("Getting studentSkill from the handler function")
  console.log("req.body is: ");
  console.log(req.body);

  const { email_address } = req.body;

  const teacher = await getTeacherFromDB(email_address);

  const result = await getSchoolClassFromDBAll(teacher.school_classes);

  res.status(200).json(result);
}
