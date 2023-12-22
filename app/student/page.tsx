export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between ">
        <h1 className={`font-bold text-2xl`}>Skills</h1>
      </div>
      <p className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        This is currently a placeholder, however this page will be used for
        gamification, overviews, personal learning recommendations and more.
      </p>
    </div>
  );
}
