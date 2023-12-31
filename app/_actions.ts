'use server'

// import { updateUser } from '@/lib/mongo/users'
import { db } from "./firebase"
import { query, collection, where, limit, setDoc, getDocs } from "firebase/firestore"

export async function updateName(name : string, email: string, firestoreDb = db) {
  // await updateUser(email, { name })
  // query to find the user from the email
  const q = query(collection(firestoreDb,"users"), where("email", "==", email), limit(1))
  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    await setDoc(doc.ref, 
      { name: name }, 
      { merge: true }
      )
  } else {
    console.error(`No user with email ${email} found`)
    throw new Error(`No user with email ${email} found`)
  }

  return true;
}