import type { NextApiRequest, NextApiResponse } from "next";
import { AstraDB } from "@datastax/astra-db-ts";

const astraDb = new AstraDB(
  process.env.ASTRA_DB_APPLICATION_TOKEN,
  process.env.ASTRA_DB_ID,
  process.env.ASTRA_DB_REGION,
  process.env.ASTRA_DB_NAMESPACE,
);

// modified version of the standard getStudentSkill script:
async function getStudentSkillFromDB(_id: string) {
  try {
    const collection = await astraDb.collection("student_skills_vec");
    const dbResponse = await collection.findOne({ _id: _id });
    // console.log("The dbResponse is: ")
    // console.log(dbResponse);
    return dbResponse || ""; // Return the response or an empty string if no skill is found
  } catch (error) {
    console.error("Error fetching student skill:", error);
    return ""; // Return an empty string in case of an error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // console.log("Getting studentSkill from the handler function")

  const { _id } = req.body;
  // console.log("The _id is: " + _id)

  const result = await getStudentSkillFromDB(_id);
  res.status(200).json(result);
}
