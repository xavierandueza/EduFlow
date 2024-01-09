"use client";

// his implementation of updateName: https://github.com/HamedBahram/next-auth-demo/blob/advanced/app/_actions.js
import React, { useState, useEffect } from "react";
import { updateUser, getRoleExtraData } from "../../_actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Role,
  FirestoreStudent,
  FirestoreParent,
  FirestoreTeacher,
} from "../../utils/interfaces";

import { ToastContainer, toast } from "react-toastify";

const UserProfileForm = () => {
  const { data: session, status, update } = useSession(); // update is used to update the session
  const router = useRouter();
  const [studentData, setStudentData] = useState<FirestoreStudent>(); // can be a teacher, parent, student
  const [parentData, setParentData] = useState<FirestoreParent>();
  const [teacherData, setTeacherData] = useState<FirestoreTeacher>();

  useEffect(() => {
    // need to declare my async function inside the useEffect
    const fetchData = async () => {
      if (session?.user?.role) {
        const roleData = await getRoleExtraData({
          id: session?.user?.id,
          role: session?.user?.role as Role,
        });
        switch (session?.user?.role) {
          case "student":
            setStudentData(roleData as FirestoreStudent);
            break;
          case "parent":
            setParentData(roleData as FirestoreParent);
            break;
          case "teacher":
            setTeacherData(roleData as FirestoreTeacher);
            break;
          default:
            break;
        }
      }
    };

    if (status === "loading") {
      return; // Do nothing while loading
    } else if (status === "unauthenticated") {
      router.push("/account/login"); // Need to log in before accessing this page
    } else if (status === "authenticated") {
      if (!session?.user?.role) {
        router.push("/account/signup"); // need to create account
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    let interests: string;
    let careerGoals: string;
    let parentLink;
    console.log(firstName);

    if (session.user.role === "student") {
      interests = formData.get("interests") as string;
      careerGoals = formData.get("careerGoals") as string;
      // get parentLink but remove whiteSpace
      parentLink = formData.get("parentLink");
      parentLink = parentLink
        ? (parentLink as string).replace(/\s/g, "")
        : null;
    } else {
      interests = null;
      careerGoals = null;
    }

    // Server action
    await updateUser({
      id: session?.user?.id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: session?.user?.role as Role,
      interests: interests,
      careerGoals: careerGoals,
      parentLink: parentLink,
      subscriptionActive: session?.user?.subscriptionActive,
      subscriptionName: session?.user?.subscriptionName,
    });

    // Update next-auth session
    await update({ firstName, lastName, email }); // updates the session, probably not the db

    // Show a toast notification
    toast("Your Account has been successfully updated.", {
      theme: "dark",
      type: "success",
      autoClose: 2000,
    });
  }

  const renderRoleSpecificFields = () => {
    switch (session?.user?.role) {
      case "parent":
        return (
          <>
            <div className="flex flex-col gap-1">
              {/* Student-specific form fields */}
              <label htmlFor="interests">Child Link</label>
              <input
                type="text"
                name="childLink"
                className="border px-2 py-1"
                required
                minLength={2}
                defaultValue={parentData?.childrenShort[0]}
              />
            </div>
          </>
        );
      case "student":
        return (
          <>
            <div className="flex flex-col gap-1">
              {/* Student-specific form fields */}
              <label htmlFor="interests">Interests</label>
              <input
                type="text"
                name="interests"
                className="border px-2 py-1"
                required
                minLength={2}
                defaultValue={studentData?.interests}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="careerGoals">Career Goals</label>
              <input
                type="text"
                name="careerGoals"
                className="border px-2 py-1"
                required
                minLength={2}
                defaultValue={studentData?.careerGoals}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="careerGoals">Parent Link</label>
              <input
                type="text"
                name="parentLink"
                className="border px-2 py-1"
                required
                minLength={2}
                defaultValue={studentData?.parentLink}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-12 w-2/3 rounded p-8 shadow-lg lg:w-1/2">
      <h2 className="mb-6 text-lg font-medium">Update your info</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          required
          className="border px-2 py-1"
          defaultValue={session?.user?.email}
        />

        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          name="firstName"
          required
          pattern="[A-Za-z ]+"
          minLength={2}
          className="border px-2 py-1"
          defaultValue={session?.user?.firstName}
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          name="lastName"
          required
          pattern="[A-Za-z ]+"
          minLength={2}
          className="border px-2 py-1"
          defaultValue={session?.user?.lastName}
        />

        {renderRoleSpecificFields()}

        <button className="mt-4 rounded bg-slate-700 px-3 py-1 text-white">
          Update
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UserProfileForm;
