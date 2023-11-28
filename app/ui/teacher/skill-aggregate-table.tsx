// import clsx from 'clsx';
// import Image from 'next/image';
import { SkillAggregate } from '../../utils/interfaces';
import ProgressBar from '../../../components/ProgressBar';


export default function DisplayAggregateSkillsTable({
  skillAggregates,
}: {
  skillAggregates: SkillAggregate[];
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={"mb-4 text-xl md:text-2xl"}>
        Class Skills
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
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
                Incomplete<br />Dependencies
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Requiring<br />Revision
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
                    <a href={`/chat?_id=${skillAggregate.skill}`} className="hover:text-blue-600" /*FIX LINKING*/ >
                      {skillAggregate.skill}
                    </a>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar score={skillAggregate.mastery_score} width="100px" backgroundColor="#388a91" />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar score={skillAggregate.retention_score} width="100px" backgroundColor="#388a91" />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {skillAggregate.no_students_not_met_dependencies}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {skillAggregate.no_students_to_revise}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
