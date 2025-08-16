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

  // The addFromText functionality is disabled for now,
  // as participants are added from the friends list or groups.
  function addFromText() {
    // const t = text.trim().replace(/,$/, "");
    // if (!t) return;
    // if (!value.find(p => `${p.first_name} ${p.last_name}` === t)) {
    //   // This would require creating a new participant object with a unique ID.
    //   // For now, we'll just disable adding new participants manually.
    // }
    // setText("");
  }

  function remove(participantId) {
    onChange(value.filter((p) => p.id !== participantId));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
          >
            {`${p.first_name} ${p.last_name || ''}`}
            <button
              aria-label={`Remove ${p.first_name}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => remove(p.id)}
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
          disabled // Disable the input for now
        />
        <Button
          variant="outline"
          onClick={addFromText}
          type="button"
          disabled // Disable the button for now
        >
          Add
        </Button>
      </div>
    </div>
  );
}