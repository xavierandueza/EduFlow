"use client";

// his implementation of updateName: https://github.com/HamedBahram/next-auth-demo/blob/advanced/app/_actions.js
import React, { useState } from "react";
import { createUser } from "../../_actions";
import { useSession } from "next-auth/react";
import { Role } from "../../utils/interfaces";

import { ToastContainer, toast } from "react-toastify";

const UserCreationForm = () => {
  const { data: session, update } = useSession(); // update is used to update the session
  const [role, setRole] = useState(""); // default role is student

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as Role;
    const email = formData.get("email") as string;
    let interests: string;
    let careerGoals: string;
    let parentLink: string;
    console.log(firstName);

    if (role === "student") {
      interests = formData.get("interests") as string;
      careerGoals = formData.get("careerGoals") as string;
      parentLink = formData.get("parentLink") as string;
    } else {
      interests = null;
      careerGoals = null;
    }

    // Server action
    await createUser({
      id: session?.user?.id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role,
      interests: interests,
      careerGoals: careerGoals,
      parentLink: parentLink,
    });

    // Update next-auth session
    await update({ firstName, lastName, role, email }); // updates the session, probably not the db

    // Show a toast notification
    toast("Your account has been successfully created.", {
      theme: "dark",
      type: "success",
      autoClose: 2000,
    });
  }

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case "parent":
        return null;
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
      <h2 className="mb-6 text-lg font-medium">Create your EduFlow Account</h2>
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

        <label htmlFor="role">Role</label>
        <select
          name="role"
          required
          className="border px-2 py-1"
          onChange={handleRoleChange}
        >
          <option value="">Select Role</option>
          <option value="parent">Parent</option>
          <option value="student">Student</option>
        </select>

        {renderRoleSpecificFields()}

        <button className="mt-4 rounded bg-slate-700 px-3 py-1 text-white">
          Create
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UserCreationForm;
