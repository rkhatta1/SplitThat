import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function ParticipantsInput({
  value,
  onChange,
  placeholder = "Add a person and press Enter"
}) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    function handleKey(e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addFromText();
      }
    }
    el?.addEventListener("keydown", handleKey);
    return () => el?.removeEventListener("keydown", handleKey);
  }, [text]);

  function addFromText() {
    const t = text.trim().replace(/,$/, "");
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setText("");
  }

  function remove(p) {
    onChange(value.filter((v) => v !== p));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
          >
            {p}
            <button
              aria-label={`Remove ${p}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => remove(p)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          variant="outline"
          onClick={addFromText}
          type="button"
        >
          Add
        </Button>
      </div>
    </div>
  );
}