"use client";
import { useState } from "react";
import { TutoringSession } from "@/app/utils/interfaces";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const hoursOfDay = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
];
const subjectOptions = [{ label: "Biology", value: "biology" }];

const DurationOptions = [
  { label: "30 minutes", value: 0.5 },
  { label: "45 minutes", value: 0.75 },
  { label: "1 hour", value: 1 },
  { label: "1 hour 15 minutes", value: 1.25 },
];

const handleSaveSession = () => {
  console.log("Saved session");
};

const EditModal = ({ session, onClose }) => {
  // Implement modal content and edit logic here
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg relative">
        <button
          className="absolute top-2 right-2 cursor-pointer bg-gray-200"
          onClick={() => onClose()}
        >
          <XMarkIcon className="h-5 hover:text-red-700" />
        </button>
        <form className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="subject">Subject</label>
            <select
              className="p-1"
              id="subject"
              name="subject"
              value={"biology"}
              onChange={(e) => console.log(e.target.value)}
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="day">Day of the week</label>
            <select
              className="p-1"
              id="day"
              name="day"
              value={session.weekday}
              onChange={(e) => console.log(e.target.value)}
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="hour">Start Time</label>
            <select
              className="p-1"
              id="hour"
              name="hour"
              value={session.startTime}
              onChange={(e) => console.log(e.target.value)}
            >
              {hoursOfDay.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="duration">Duration (hours)</label>
            <select
              className="p-1"
              id="duration"
              name="duration"
              value={session.duration}
              onChange={(e) => console.log(e.target.value)}
            >
              {DurationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <button
              className="bg-gray-200 hover:bg-light-teal p-0.5 rounded"
              onClick={handleSaveSession}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChildTutoringTime = ({ childTutoringSession }) => {
  const [editingSession, setEditingSession] = useState(null);

  const handleEdit = (session) => {
    setEditingSession(session);
  };

  const handleCloseModal = () => {
    setEditingSession(null);
  };

  const [newSessionDay, setNewSessionDay] = useState("");
  const [newSessionHour, setNewSessionHour] = useState("");

  const handleSaveSession = () => {
    // TODO: Save the new session to the child's data
    console.log(`Saved session on ${newSessionDay} at ${newSessionHour}}`);
    // Update state with new session data
  };

  return (
    <div>
      {childTutoringSession && childTutoringSession.length > 0
        ? childTutoringSession.map((sessionObject) => {
            // Extract the ID and data from each session object
            const [key, value] = Object.entries(sessionObject)[0];

            const sessionData: TutoringSession = value as TutoringSession;

            return (
              <>
                <div className="flex flex-row justify-between" key={key}>
                  {sessionData.weekday}: {sessionData.startTime} -{" "}
                  {sessionData.startTime + sessionData.duration * 100}
                  <button
                    className="rounded px-0.5 hover:bg-light-teal"
                    onClick={() => handleEdit(sessionData)}
                  >
                    <PencilSquareIcon className="h-5" />
                  </button>
                </div>
              </>
            );
          })
        : null}
      {editingSession && (
        <EditModal session={editingSession} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ChildTutoringTime;
