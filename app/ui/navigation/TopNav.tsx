"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Dummy links for demonstration
const navLinks = [
  { name: "About", href: "/about" },
  { name: "Students", href: "/student" },
  { name: "Parents", href: "/parent" },
];

export const topNavHeight = "4rem";

export default function TopNav() {
  // State to track the current active link
  const pathname = usePathname();

  return (
    <nav
      className="bg-dark-blue p-2 w-screen fixed top-0 z-50"
      style={{ height: topNavHeight }}
    >
      <div className="flex justify-center space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "text-white hover:text-black px-3 py-2 rounded-md text-sm font-medium",
              {
                "bg-dark-teal": pathname === link.href,
              }
            )}
          >
            <p className="hidden md:block text-lg">{link.name}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
