import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../app/firebase";
import { getTeacherFromDB } from "../../app/utils/databaseFunctionsFirestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email } = req.body;

  const result = await getTeacherFromDB(email);

  res.status(200).json(result);
}
