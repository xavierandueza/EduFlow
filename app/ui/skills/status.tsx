import clsx from 'clsx';

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
          No
        </>
      ) : null}
      {needToRevise ? (
        <>
          Yes
        </>
      ) : null}
    </span>
  );
}
