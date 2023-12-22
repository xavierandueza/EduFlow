import React from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const InteractiveButton = () => {
  const addDataToDB = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        first: "Ada",
        last: "Lovelace",
        born: 1815,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <button
      onClick={addDataToDB}
      className="rounded-lg bg-388a91 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-17363f md:text-base"
    >
      Add New Info
    </button>
  );
};

export default InteractiveButton;
