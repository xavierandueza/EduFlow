// import Image from 'next/image';
import NeedToReviseStatus from "./status";
// import { formatDateToLocal, formatCurrency } from '../../lib/utils';
import { getStudentSkillFromDb } from "../../utils/databaseFunctionsFirestore";
import ProgressBar from "../../../components/ProgressBar";

export default async function SkillsTable({
  query,
  currentPage,
  email,
}: {
  query: string;
  currentPage: number;
  email: string;
}) {
  const studentSkills = await getStudentSkillFromDb(email);
  console.log(studentSkills[0]);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {studentSkills?.map((studentSkill) => (
              <div
                key={studentSkill.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="font-bold hover:text-blue-600">
                        {studentSkill.skill}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {studentSkill.subject}
                    </p>
                  </div>
                  <NeedToReviseStatus
                    needToRevise={studentSkill.needToRevise}
                  />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <ProgressBar
                      score={studentSkill.masteryScore}
                      width="200px"
                      backgroundColor="#388a91"
                    />
                    <ProgressBar
                      score={studentSkill.masteryScore}
                      width="200px"
                      backgroundColor="#388a91"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Skill
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Subject
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Mastery Score
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Retention Score
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Revise
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {studentSkills?.map((studentSkill) => (
                <tr
                  key={studentSkill.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/chat?id=${studentSkill.id}`}
                        className="hover:text-blue-600"
                      >
                        {studentSkill.skill}
                      </a>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {studentSkill.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <ProgressBar
                      score={studentSkill.masteryScore}
                      width="100px"
                      backgroundColor="#388a91"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <ProgressBar
                      score={studentSkill.retentionScore}
                      width="100px"
                      backgroundColor="#388a91"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <NeedToReviseStatus
                      needToRevise={studentSkill.needToRevise}
                    />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
