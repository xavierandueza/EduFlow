// import clsx from 'clsx';
// import Image from 'next/image';
import { StudentAggregate } from "../../utils/interfaces";
import ProgressBar from "../../../components/ProgressBar";
import Search from "../../ui/search";

export default function DisplayAggregateStudentsTable({
  studentAggregates,
}: {
  studentAggregates: StudentAggregate[];
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={"mb-4 text-xl md:text-2xl"}>Students</h2>
      <div className="mb-4 flex items-center justify-between gap-2 ">
        <Search placeholder="Search skills..." />
      </div>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-1">
        {/* NOTE: comment in this code when you get to this point in the course */}
        <table className="hidden min-w-full text-gray-900 md:table">
          <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                Full Name
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Average Mastery
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Average Retention
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Requiring
                <br />
                Revision
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {studentAggregates?.map((studentAggregate) => (
              <tr
                key={studentAggregate.email_address}
                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/teacher/classes/student?email_address=${studentAggregate.email_address}&class_name=${studentAggregate.school_class_name}`}
                      className="hover:text-blue-600" /*FIX LINKING*/
                    >
                      {studentAggregate.full_name}
                    </a>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={studentAggregate.mastery_score}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <ProgressBar
                    score={studentAggregate.retention_score}
                    width="100px"
                    backgroundColor="#388a91"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {studentAggregate.skills_to_revise}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
