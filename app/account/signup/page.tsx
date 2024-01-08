"use client";
// can use middleware or in-page code to check if user is authenticated
import UserCreationForm from "../../ui/account/UserCreationForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Need to log in before accessing this page
    } else if (session?.user?.role) {
      router.push("/account/profile");
    } // else actually load the page
  }, [status, session, router]);

  if (
    status === "loading" ||
    status === "unauthenticated" ||
    session?.user?.role
  ) {
    return null; // Or a loading indicator, or nothing if redirect is fast
  }

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-2xl font-bold">Profile</h1>

        <UserCreationForm />
      </div>
    </section>
  );
};

export default Page;
