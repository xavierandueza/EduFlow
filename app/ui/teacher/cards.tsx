import {
  SchoolClass,
  FirestoreTeacherSchoolClass,
} from "../../utils/interfaces";

export function ClassCard({
  schoolClass,
}: {
  schoolClass: FirestoreTeacherSchoolClass;
}) {
  return (
    <div
      className="rounded-xl bg-gray-50 p-2 shadow-sm " /*p-2 changes the distance from the edges it seems*/
    >
      <div className="flex p-4">
        <h1>{schoolClass.subject}</h1>
      </div>
      <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
        <a
          href={`/teacher/classes?id=${schoolClass.id}`}
          className="hover:text-blue-600" /*FIX LINKING*/
        >
          {
            schoolClass.name /*What is actually displayed in the card, so whatever I want to put in here */
          }
        </a>
      </p>
    </div>
  );
}

export function PrepForClassCard({
  schoolClass,
}: {
  schoolClass: FirestoreTeacherSchoolClass;
}) {
  return (
    <div
      className="rounded-xl bg-gray-50 p-2 shadow-sm " /*p-2 changes the distance from the edges it seems*/
    >
      <div className="flex p-4">
        <h1>{schoolClass.subject}</h1>
      </div>
      <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
        <a
          href={`/teacher/classes?_id=${schoolClass.id}`}
          className="hover:text-blue-600" /*FIX LINKING*/
        >
          {
            schoolClass.name /*What is actually displayed in the card, so whatever I want to put in here */
          }
        </a>
      </p>
    </div>
  );
}
