import { ClassCard } from '../ui/teacher/cards'; 
import { getTeacherFromDB, getSchoolClassFromDBAll } from '../utils/databaseFunctions';
 
export default async function Page() {
  const teacher = await getTeacherFromDB("clara@everdawn.ai");
  console.log(teacher);

  const schoolClassList = await getSchoolClassFromDBAll(teacher.school_classes);
 
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">
        Classes
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {schoolClassList.map((schoolClass, index) => (
          <ClassCard key={index} schoolClass={schoolClass} />
        ))}
      </div>
      <div className="flex-grow mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <p>Placeholder for a calendar </p>
        <p>Placeholder for a notification section </p>
      </div>
    </main>
  );
}