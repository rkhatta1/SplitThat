import { createContext, useContext, useMemo, useState } from "react";

const SplitContext = createContext(null);

export function SplitProvider({ children }) {
  const [file, setFile] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [distribution, setDistribution] = useState({
    tax: "equal", // or "proportional"
    tip: "equal"
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const value = useMemo(
    () => ({
      file,
      setFile,
      participants,
      setParticipants,
      userPrompt,
      setUserPrompt,
      result,
      setResult,
      distribution,
      setDistribution,
      groups,
      setGroups,
      selectedGroup,
      setSelectedGroup,
      currentUser,
      setCurrentUser
    }),
    [file, participants, userPrompt, result, distribution, groups, selectedGroup, currentUser]
  );

  return (
    <SplitContext.Provider value={value}>
      {children}
    </SplitContext.Provider>
  );
}

export function useSplit() {
  const ctx = useContext(SplitContext);
  if (!ctx) {
    throw new Error("useSplit must be used inside SplitProvider");
  }
  return ctx;
}