"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import type { ImageLoaderProps } from "next/image";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-388a91 p-4 md:h-40"></div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <Image
            src="/images/eduflow_logo.svg"
            alt="EduFlow logo"
            width={500}
            height={500}
            layout="responsive"
          />
          <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            Personalised learning for every student
          </p>
          <button
            onClick={() => signIn()}
            className="flex items-center gap-5 self-start rounded-lg bg-388a91 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-17363f md:text-base"
          >
            <span>Login</span>
          </button>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <Image
            src="/images/eduflow_screens.svg"
            alt="EduFlow Display Screens"
            width={500}
            height={500}
            layout="responsive"
          />
        </div>
      </div>
    </main>
  );
}
