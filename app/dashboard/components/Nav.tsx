"use client";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Settings from "./components/Settings";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Analytics",
    href: "/analytics",
  },
  {
    name: "Skills",
    href: "/skills",
  },
  {
    name: "Profile",
    href: "/profile",
  },
];

const Nav = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  return (
    <>
      <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Button variant="ghost" className="p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                "https://lh3.googleusercontent.com/a/ACg8ocIuzKCL5p4HMLr8UONbwbY7PV0o1QFxOs2gQnATCy5KHw=s96-c"
              }
              alt={"Placeholder avatar"}
            />
            <AvatarFallback className="h-16 w-16 flex item-center">
              {"x".toUpperCase()}
              {"a".toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
        {links.map((link) => {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "font-bold"
                  : "text-gray-500 dark:text-gray-400 font-semibold hover:text-black"
              }
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="flex-1 ml-auto sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              placeholder="Search..."
              type="search"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Settings session={session} />
      </div>
    </>
  );
};

export default Nav;
