import Image from 'next/image';
import NeedToReviseStatus from './status';
import { formatDateToLocal, formatCurrency } from '../../lib/utils';

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // const invoices = await fetchFilteredInvoices(query, currentPage);
  const invoices = [
    {
      id: '1',
      name: 'John Doe',
      email: 'johndoe@mail.com',
      status: 'pending',
      amount: 100.0,
      date: '2021-08-01',
    }
  ]

  const studentSkills = [
    {
      id: '1',
      "email_address" : 'xand0001@student.monash.edu',
      "subject" : 'Biology',
      "skill" : 'Extremophiles on Earth',
      "mastery_score" : 0,
      "retention_score" : 0,
      "need_to_revise" : false,
      "decay_value" : 0.5,
    }
  ]

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
                      <p>{studentSkill.subject}</p>
                    </div>
                    <p className="text-sm text-gray-500">{studentSkill.skill}</p>
                  </div>
                  <NeedToReviseStatus needToRevise={studentSkill.need_to_revise} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {studentSkill.mastery_score}
                    </p>
                    <p>{studentSkill.retention_score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Subject
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Skill
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
                      <p>{studentSkill.subject}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {studentSkill.skill}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {studentSkill.mastery_score}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {studentSkill.retention_score}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <NeedToReviseStatus needToRevise={studentSkill.need_to_revise} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
