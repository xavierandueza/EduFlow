"use client";
import { useSession, signIn, signOut } from "next-auth/react"

export default function Page() {
  const { data: session, status } = useSession()
  const userEmail = session?.user?.email
  console.log(session?.user)

  if (status === "loading") {
    return <p>Loading in the status...</p>
  }

  if (status === "authenticated") {
    return (
      <>
        <p>Signed in as {userEmail}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }

  return (
    <>
      <p>Not signed in.</p>
      <button onClick={() => signIn("google")}>Sign in</button>
    </>
  )
}