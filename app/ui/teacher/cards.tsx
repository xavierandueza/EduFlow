import { SchoolClass } from "../../utils/interfaces";

export function ClassCard({
  schoolClass
}: {
  schoolClass: SchoolClass;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm " /*p-2 changes the distance from the edges it seems*/> 
      <div className="flex p-4" /*seems to create the borded distances (from edges) */>
        <h1>{schoolClass.subject}</h1>
      </div>
      <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
        <a href={`/teacher/classes?_id=${schoolClass._id}`} className="hover:text-blue-600" /*FIX LINKING*/ >
          {schoolClass.school_class_name /*What is actually displayed in the card, so whatever I want to put in here */}
        </a>
      </p>
    </div>
  );
}


