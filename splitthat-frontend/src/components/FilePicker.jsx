import { useRef, useState } from "react";
import { Button } from "./ui/button";

export default function FilePicker({ accept, onFile }) {
  const inputRef = useRef(null);
  const [name, setName] = useState("");

  function onChange(e) {
    const f = e.target.files?.[0];
    if (f) {
      setName(`${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`);
      onFile(f);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={onChange}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Choose file
      </Button>
      <div className="text-sm text-muted-foreground">
        {name || "No file selected"}
      </div>
    </div>
  );
}