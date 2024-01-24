"use client";
import { useState, useEffect, useRef } from "react";
import { LinkedUser } from "@/app/utils/interfaces";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import handleCreateCheckoutSession from "@/app/utils/handleCreateCheckoutSession";
import { getStudentDataFromParents } from "@/app/_actions";
import { Session } from "next-auth";
import { getUserFromDb } from "@/app/utils/databaseFunctionsFirestore";

const SubscriptionPlanCard = ({
  planName,
  planPrice,
  planDescription,
  majorPoints,
  priceId,
  studentId, // if a parent is getting for a student
  router,
  session,
}: {
  planName: string;
  planPrice: number;
  planDescription: string;
  majorPoints: { [key: string]: boolean };
  priceId: string;
  studentId: string | null;
  router: AppRouterInstance;
  session: Session;
}) => {
  return <></>;
  /*
  const [childUserData, setChildUserData] = useState<
    LinkedUser | null
  >(null);
  const hasFetchedChildData = useRef(false);

  useEffect(() => {
    const fetchChildData = async () => {
      if (studentId || session?.user?.role === "student") {
        const user = await getUserFromDb({
          id: studentId ? studentId : session.user.id,
        });
        setChildUserData({
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionActive: user.subscriptionActive,
          subscriptionName: user.subscriptionName,
        } as LinkedUser);
      } else if (session?.user?.role === "parent") {
        const data = await getStudentDataFromParents({
          parentId: session.user.id,
        });
        setChildUserData(data);
        // Handle the case where there are more than one children differently,
        // maybe by setting state to an array and choosing from a dropdown in the UI.
      }
    };

    if (!hasFetchedChildData.current) {
      // only get it if it doesn't exist yet.
      fetchChildData();
      hasFetchedChildData.current = true;
    }
  }, [studentId, session?.user?.role, session?.user?.id]);

  // code to render the subscribe button
  const renderSubscribeButton = () => {
    // first case - they aren't logged in. At this point, you want to have a button telling them to log
    // in or create an account
    if (!session?.user?.role) {
      // at present just pushes to account creation, ideally have a pop up instead
      console.log("No user session or role at all, so need to log in/sign up");
      return (
        <button
          type="button"
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          onClick={() => router.push("/api/auth/signin")}
        >
          Subscribe for ${planPrice}
        </button>
      );
    } else if (session.user.role === "student") {
      console.log("Student");
      // subscription should go straight to checkout
      return (
        <button
          type="button"
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          onClick={() =>
            handleCreateCheckoutSession(priceId, session.user.id, childUserData)
          }
        >
          Subscribe for ${planPrice}
        </button>
      );
    } else if (session.user.role === "parent") {
      console.log("Parent");
      console.log("Child user data", childUserData);
      // as above with slight modifications
      // Check to see whether we have a studentId inputted

      if (studentId) {
        // if we have a studentId, we can get the student's user data and use that
        return (
          <button
            type="button"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            onClick={() =>
              handleCreateCheckoutSession(priceId, studentId, childUserData)
            }
          >
            Subscribe for ${planPrice}
          </button>
        );
      }
      if (!studentId) {
        console.log("No student id");
        // if there is only one child, then we can just use that, no other possible children they're paying for
        if (!childUserData) {
          console.log("No child data");
          return (
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={() => router.push("/parent/add-student")}
            >
              Subscribe for ${planPrice}
            </button>
          );
        } else if (Object.keys(childUserData).length === 0) {
          // they need to add a student
          // push to the add a student page for now, but want to have this be a pop up instead.
          console.log("No child data");
          return (
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={() => router.push("/parent/add-student")}
            >
              Subscribe for ${planPrice}
            </button>
          );
        } else if (Object.keys(childUserData).length === 1) {
          console.log("Only one child");

          return (
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={() =>
                handleCreateCheckoutSession(
                  priceId,
                  Object.keys(childUserData)[0],
                  Object.values(childUserData)[0]
                )
              }
            >
              Subscribe for ${planPrice}
            </button>
          );
        } else if (Object.keys(childUserData).length > 1) {
          console.log("More than one child");
          // need to have a pop up for them to select which child they want to pay for
          return (
            // for now just want them to go back to their main account, eventually want a pop-up
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={() => router.push("/parent")}
            >
              Subscribe for ${planPrice}
            </button>
          );
        }
      }
    }
  };

  return (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden m-4">
      <div className="p-5">
        <h5 className="text-gray-900 text-xl leading-tight font-medium mb-2 text-center">
          {planName}
        </h5>
        <p className="text-gray-700 text-base mb-4 text-center">
          {planDescription}
        </p>
        <ul className="list-disc space-y-2 mb-4 text-center">
          {Object.entries(majorPoints).map(([point, isTrue]) => (
            <li
              key={point}
              className={`text-gray-600 ${
                isTrue ? "font-semibold" : "text-gray-400"
              }`}
            >
              {point}
            </li>
          ))}
        </ul>
        {renderSubscribeButton()}
      </div>
    </div>
  );
    */
};

export default SubscriptionPlanCard;
