"use client";
import React, { useState, useRef } from "react";
import { TutoringSession, Weekday } from "@/app/utils/interfaces";
import EditTutoringSession from "./components/EditTutoringSession";
import { useTutoringSessions } from "../contexts/TutoringSessionContext";
import DeleteTutoringSession from "./components/DeleteTutoringSession";
import {
  capitaliseFirstLetter,
  convertFrom24HourTo12Hour,
} from "@/app/utils/textManipulation";
import { format } from "date-fns";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ChildTutoringSession = ({ studentId }: { studentId: string }) => {
  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Subject</TableHead>
            <TableHead className="w-1/4">Session Time</TableHead>
            <TableHead className="w-1/4">Date</TableHead>
            <TableHead className="w-1/4">Session Type</TableHead>
            <TableHead className="w-auto"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {childTutoringSession && childTutoringSession.length > 0
            ? childTutoringSession.map((sessionObject) => {
                // Extract the ID and data from each session object
                const [tutoringSessionId, value] =
                  Object.entries(sessionObject)[0];

                const tutoringSessionData: TutoringSession =
                  value as TutoringSession;

                return (
                  <>
                    <TableRow>
                      <TableCell>
                        {capitaliseFirstLetter(tutoringSessionData.subject)}
                      </TableCell>
                      <TableCell>
                        {format(tutoringSessionData.dateTime, "EEEE h:mm a")}
                      </TableCell>
                      <TableCell>
                        {format(tutoringSessionData.dateTime, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {tutoringSessionData.repeats ? (
                          <Badge variant="default" className="bg-light-teal">
                            Weekly
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-slate-400">
                            Once Off
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex float-right">
                        <EditTutoringSession
                          studentId={studentId}
                          existingTutoringSessionId={tutoringSessionId}
                        />
                        <DeleteTutoringSession
                          studentId={studentId}
                          existingTutoringSessionId={tutoringSessionId}
                        />
                      </TableCell>
                    </TableRow>
                  </>
                );
              })
            : null}
        </TableBody>
      </Table>
      <div className="ml-2 my-4">
        <EditTutoringSession studentId={studentId} />
      </div>
    </div>
  );
};

export default ChildTutoringSession;
