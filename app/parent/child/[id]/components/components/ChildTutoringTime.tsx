"use client";
import React, { useState, useRef } from "react";
import { TutoringSession, Weekday } from "@/app/utils/interfaces";
import EditTutoringSession from "./components/EditTutoringSession";
import { useTutoringSessions } from "../../contexts/TutoringSessionContext";
import DeleteTutoringSession from "./components/DeleteTutoringSession";

const ChildTutoringTime = ({ studentId }: { studentId: string }) => {
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();

  return (
    <div>
      {childTutoringSession && childTutoringSession.length > 0
        ? childTutoringSession.map((sessionObject) => {
            // Extract the ID and data from each session object
            const [tutoringSessionId, value] = Object.entries(sessionObject)[0];

            const tutoringSessionData: TutoringSession =
              value as TutoringSession;

            return (
              <div
                className="flex flex-row justify-between items-center my-1 bg-slate-200 p-1.5 rounded"
                key={tutoringSessionId}
              >
                {tutoringSessionData.weekday} {tutoringSessionData.startTime}-{" "}
                {tutoringSessionData.startTime +
                  tutoringSessionData.duration * (10 / 6)}
                : {tutoringSessionData.subject}
                <div>
                  <EditTutoringSession
                    studentId={studentId}
                    existingTutoringSessionId={tutoringSessionId}
                  />
                  <DeleteTutoringSession
                    studentId={studentId}
                    existingTutoringSessionId={tutoringSessionId}
                  />
                </div>
              </div>
            );
          })
        : null}
      <EditTutoringSession studentId={studentId} />
    </div>
  );
};

export default ChildTutoringTime;
