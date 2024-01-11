"use client";
import React, { useState, useRef } from "react";
import { TutoringSession, Weekday } from "@/app/utils/interfaces";
import EditTutoringSession from "./components/EditTutoringSession";

const ChildTutoringTime = ({
  studentId,
  childTutoringSession,
}: {
  studentId: string;
  childTutoringSession: { [id: string]: TutoringSession }[];
}) => {
  const elementRef = useRef;
  const [editingTutoringSession, setEditingTutoringSession] =
    useState<TutoringSession>(null);
  const [editingTutoringSessionId, setEditingTutoringSessionId] =
    useState<string>(null);
  const [editing, setEditing] = useState<boolean>(null);

  const flipEditing = (
    tutoringSession: TutoringSession,
    tutoringSessionId?: string
  ) => {
    setEditing(!editing);
    setEditingTutoringSession(tutoringSession);
    tutoringSessionId ? setEditingTutoringSessionId(tutoringSessionId) : null;
  };

  console.log("studentId on ChildTutoringTime.tsx file is: " + studentId);

  return (
    <div>
      {childTutoringSession && childTutoringSession.length > 0
        ? childTutoringSession.map((sessionObject) => {
            // Extract the ID and data from each session object
            const [tutoringSessionId, value] = Object.entries(sessionObject)[0];

            const tutoringSessionData: TutoringSession =
              value as TutoringSession;

            return (
              <>
                <div
                  className="flex flex-row justify-between items-center my-1 bg-gray-200 p-1.5 rounded"
                  key={tutoringSessionId}
                >
                  {tutoringSessionData.weekday} {tutoringSessionData.startTime}-{" "}
                  {tutoringSessionData.startTime +
                    tutoringSessionData.duration * (10 / 6)}
                  : {tutoringSessionData.subject}
                  <EditTutoringSession
                    studentId={studentId}
                    existingTutoringSessionId={tutoringSessionId}
                    existingTutoringSession={tutoringSessionData}
                  />
                </div>
              </>
            );
          })
        : null}
      <EditTutoringSession studentId={studentId} />
    </div>
  );
};

export default ChildTutoringTime;
