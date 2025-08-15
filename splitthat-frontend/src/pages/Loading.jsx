import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { Spinner } from "../components/ui/spinner";
import { useSplit } from "../state/SplitContext";
import { useSplitProcessing } from "../hooks/useSplitProcessing";

export default function Loading() {
  const nav = useNavigate();
  const loc = useLocation();
  const { file, participants, userPrompt, result } = useSplit();
  const { run, error, status } = useSplitProcessing();

  useEffect(() => {
    if (!file || !participants.length) {
      nav("/");
      return;
    }
    if (loc.state?.from === "home" && !result) {
      run({ file, participants, prompt: userPrompt }).then((ok) => {
        if (ok) nav("/editor");
      });
    }
  }, [file, participants, userPrompt, nav, run, result, loc.state]);

  return (
    <div className="min-h-full">
      <TopNav />
      <main className="container flex flex-col items-center gap-4 py-16">
        <Spinner size={56} />
        <h1 className="text-xl font-semibold">
          Analyzing your receipt…
        </h1>
        <p className="text-sm text-muted-foreground">
          This can take a few seconds.
        </p>
        {status === "error" && (
          <p className="text-sm text-destructive">
            {error?.message || "Something went wrong."}
          </p>
        )}
      </main>
    </div>
  );
}