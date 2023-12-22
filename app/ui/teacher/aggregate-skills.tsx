import clsx from "clsx";
// import Image from 'next/image';
import { SkillAggregate } from "../../utils/interfaces";

export default async function DisplayAggregateSkills({
  aggregatedSkills,
}: {
  aggregatedSkills: SkillAggregate[];
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={"mb-4 text-xl md:text-2xl"}>Class Skills</h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {/* NOTE: comment in this code when you get to this point in the course */}

        <div className="bg-white px-6">
          {aggregatedSkills.map((aggregatedSkill, i) => {
            return (
              <div
                key={aggregatedSkill.skill}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {aggregatedSkill.skill}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {aggregatedSkill.skill}
                    </p>
                  </div>
                </div>
                <p className={"truncate text-sm font-medium md:text-base"}>
                  {aggregatedSkill.mastery_score}
                </p>
                <p className={"truncate text-sm font-medium md:text-base"}>
                  {aggregatedSkill.retention_score}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
