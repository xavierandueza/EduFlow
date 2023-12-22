// import clsx from 'clsx';
// import Image from 'next/image';
import { FirestoreSkillAggregate, FirestoreExtendedSkillAggregate } from "../../utils/interfaces";
import ProgressBar from "../../../components/ProgressBar";
import Search from "../../ui/search";
import IncludeInClassLessonPlan from "./status";

export default function DisplayAggregateSkillsTable({
  skillAggregates,
}: {
  skillAggregates: FirestoreSkillAggregate[];
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={"mb-4 text-xl md:text-2xl"}>Skills</h2>
      <div className="mb-4 flex items-center justify-between gap-2 ">
        <Search placeholder="Search skills..." />
      </div>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-1">
        {/* NOTE: comment in this code when you get to this point in the course */}
        <table className="hidden min-w-full text-gray-900 md:table">
          <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                Skill
              </th>
              <th scope="col" className="px-3 py-5 font-medium ">
                Mastery
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Retention
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Incomplete
                <br />
                Dependencies
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Requiring
                <br />
                Revision
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {skillAggregates?.map((skillAggregate) => (
              <tr
                key={skillAggregate.skill}
                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/teacher/classes/skills?class_name=${skillAggregate.schoolClass}&skill=${skillAggregate.skill}`}
                      className="hover:text-blue-600" /*FIX LINKING*/
                    >
                      {skillAggregate.skill}
                    </a>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={skillAggregate.masteryScore}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={skillAggregate.retentionScore}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {skillAggregate.noStudentsNotMetDependencies}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {skillAggregate.noStudentsToRevise}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DisplayAggregateSkillsTableWithSelection({
  extendedSkillAggregates,
  onToggle,
}: {
  extendedSkillAggregates: FirestoreExtendedSkillAggregate[];
  onToggle: (skillName: string) => void;
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={"mb-4 text-xl md:text-2xl"}>Skills</h2>
      <div className="mb-4 flex items-center justify-between gap-2 ">
        <Search placeholder="Search skills..." />
      </div>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-1">
        {/* NOTE: comment in this code when you get to this point in the course */}
        <table className="hidden min-w-full text-gray-900 md:table">
          <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                Skill
              </th>
              <th scope="col" className="px-3 py-5 font-medium ">
                Mastery
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Retention
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Incomplete
                <br />
                Dependencies
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Requiring
                <br />
                Revision
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {extendedSkillAggregates?.map((extendedSkillAggregate) => (
              <tr
                key={extendedSkillAggregate.skill}
                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div
                    className="flex items-center gap-3"
                    onClick={() => onToggle(extendedSkillAggregate.skill)}
                  >
                    <IncludeInClassLessonPlan
                      includeInClassLessonPlan={
                        extendedSkillAggregate.includeInLessonPlan
                      }
                    />
                    {extendedSkillAggregate.skill}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={extendedSkillAggregate.masteryScore}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={extendedSkillAggregate.retentionScore}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {extendedSkillAggregate.noStudentsNotMetDependencies}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {extendedSkillAggregate.noStudentsToRevise}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
