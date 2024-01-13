// contexts/TutoringSessionsContext.tsx
import { createContext, useContext, useState } from "react";
import { TutoringSession } from "@/app/utils/interfaces";

const TutoringSessionsContext = createContext({
  childTutoringSession: [],
  setChildTutoringSession: (
    sessions: { [id: string]: TutoringSession }[]
  ) => {},
});

export const useTutoringSessions = () => useContext(TutoringSessionsContext);

export const TutoringSessionsProvider = ({ children }) => {
  const [childTutoringSession, setChildTutoringSession] = useState<
    { [id: string]: TutoringSession }[]
  >([]);

  return (
    <TutoringSessionsContext.Provider
      value={{ childTutoringSession, setChildTutoringSession }}
    >
      {children}
    </TutoringSessionsContext.Provider>
  );
};
