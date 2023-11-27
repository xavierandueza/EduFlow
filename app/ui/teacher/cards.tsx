export function ClassCard({
  title,
  value,
  classId,
}: {
  title: string;
  value: number | string;
  classId: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm " /*p-2 changes the distance from the edges it seems*/> 
      <div className="flex p-4" /*seems to create the borded distances (from edges) */>
        <h1>{title}</h1>
      </div>
      <p
        className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
        {value /*What is actually displayed in the card, so whatever I want to put in here */}
      </p>
    </div>
  );
}


