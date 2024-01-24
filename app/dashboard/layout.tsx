import { topNavHeight } from "@/app/ui/navigation/TopNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  /* 
  This is a layout component, which is used to wrap pages.
  Using the below to get a top navigation bar spacing
  first div is a spacer, second div is the top nav bar. Third is the page content, where children go
  */
  return (
    <>
      <div className="flex flex-col w-screen min-h-screen">
        <main
          style={{ paddingTop: topNavHeight }}
          className="flex-grow md:overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </>
  );
}
