"use client";
import React, { useState, useRef } from "react";
import { TutoringSession, Weekday } from "@/app/utils/interfaces";
import { insertTutoringSession } from "@/app/utils/databaseFunctionsFirestore";

const ChildTutoringTime = ({ childTutoringSession }) => {
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
                  className="flex flex-row justify-between"
                  key={tutoringSessionId}
                >
                  {tutoringSessionData.weekday}: {tutoringSessionData.startTime}{" "}
                  -{" "}
                  {tutoringSessionData.startTime +
                    tutoringSessionData.duration * 100}
                </div>
              </>
            );
          })
        : null}
    </div>
  );
};

export default ChildTutoringTime;
