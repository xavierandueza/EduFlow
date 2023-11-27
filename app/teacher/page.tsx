import { ClassCard } from '../ui/teacher/cards'; 
 
export default async function Page() {
 
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">
        Classes
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ClassCard title="Biology" value="class1" classId = "biology1"/>
        <ClassCard title="Biology" value="class2" classId = "biology2" />
        <ClassCard title="Mathematics" value="class1" classId="mathematics1" />
        <ClassCard title="Mathematics" value="class2" classId="mathematics2" />
      </div>
      <div className="flex-grow mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <ClassCard title="Biology" value="class1" classId = "biology1"/>
        <ClassCard title="Biology" value="class2" classId = "biology2" />
      </div>
    </main>
  );
}