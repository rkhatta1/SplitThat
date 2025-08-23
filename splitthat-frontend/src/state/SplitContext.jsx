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
  const [expenseId, setExpenseId] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentSplit, setCurrentSplit] = useState(null);
  const [refreshSplits, setRefreshSplits] = useState(0);
  const [shopName, setShopName] = useState("");
  const [paidBy, setPaidBy] = useState(null);
  const [dateOfPurchase, setDateOfPurchase] = useState("");

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
      setCurrentUser,
      expenseId,
      setExpenseId,
      open,
      setOpen,
      currentSplit,
      setCurrentSplit,
      refreshSplits,
      setRefreshSplits,
      shopName,
      setShopName,
      paidBy,
      setPaidBy,
      dateOfPurchase,
      setDateOfPurchase
    }),
    [file, participants, userPrompt, result, distribution, groups, selectedGroup, currentUser, expenseId, open, currentSplit, refreshSplits, shopName, paidBy, dateOfPurchase]
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