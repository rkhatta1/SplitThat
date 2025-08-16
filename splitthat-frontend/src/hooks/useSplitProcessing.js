import { useCallback, useRef, useState } from "react";
import { splitBill } from "../api/client";
import { useSplit } from "../state/SplitContext";

export function useSplitProcessing() {
  const { setResult } = useSplit();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const abortRef = useRef(null);

  const run = useCallback(async ({ file, participants, prompt }) => {
    setError(null);
    setStatus("loading");
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const participantNames = participants.map(p => `${p.first_name} ${p.last_name || ''}`);
      const data = await splitBill({
        file,
        participants: participantNames,
        userPrompt: prompt,
        signal: ctrl.signal
      });
      console.log("Data from backend:", data);
      // Ensure items array exists
      const items = Array.isArray(data.items) ? data.items : [];
      setResult({
        ...data,
        items: items.map((it, idx) => ({
          id: `${idx}-${it.item_name ?? "item"}`,
          ...it,
          assigned_to: Array.isArray(it.assigned_to) && it.assigned_to.length > 0
            ? it.assigned_to
            : participantNames
        }))
      });
      setStatus("done");
      return true;
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e);
        setStatus("error");
      }
      return false;
    }
  }, [setResult]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  return { run, cancel, error, status };
}