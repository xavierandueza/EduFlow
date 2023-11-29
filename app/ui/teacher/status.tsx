import { PlusCircleIcon as PlusCircleOutline} from '@heroicons/react/24/outline';
import { PlusCircleIcon as PlusCircleSolid} from '@heroicons/react/24/solid';

export default function IncludeInClassLessonPlan({ includeInClassLessonPlan }: { includeInClassLessonPlan: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs">
      {!includeInClassLessonPlan ? (
        <>
          <PlusCircleOutline className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {includeInClassLessonPlan ? (
        <>
          <PlusCircleSolid className="ml-1 w-4 text-highlight" />
        </>
      ) : null}
    </span>
  );
}
