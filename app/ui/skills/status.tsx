import clsx from 'clsx';
import { ExclamationTriangleIcon as ExclamationTriangleOutline} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleSolid} from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutline} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid} from '@heroicons/react/24/solid';
import {CheckIcon as CheckIconSolid} from '@heroicons/react/24/solid';


export default function needToReviseStatus({ needToRevise }: { needToRevise: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': !needToRevise,
          'bg-green-500 text-white': needToRevise,
        },
      )}
    >
      {!needToRevise ? (
        <>
          <CheckCircleOutline className="ml-1 w-4
          text-highlight" />
        </>
      ) : null}
      {needToRevise ? (
        <>
          <ExclamationTriangleOutline className="ml-1 w-4 text-highlight" />
        </>
      ) : null}
    </span>
  );
}