import { useState } from "react";
import { Input } from "./ui/input";

export default function ParticipantsInput({
  value,
  onChange,
  availableParticipants,
  placeholder = "Search for participants to add"
}) {
  const [searchText, setSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filteredParticipants = searchText
    ? availableParticipants.filter(p =>
        `${p.first_name} ${p.last_name || ''}`.toLowerCase().includes(searchText.toLowerCase()) &&
        !value.some(selected => selected.id === p.id)
      )
    : [];

  function addParticipant(participant) {
    onChange([...value, participant]);
    setSearchText("");
    setHighlightedIndex(-1);
  }

  function remove(participantId) {
    onChange(value.filter((p) => p.id !== participantId));
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prevIndex =>
        prevIndex < filteredParticipants.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === "Enter" && highlightedIndex > -1) {
      e.preventDefault();
      addParticipant(filteredParticipants[highlightedIndex]);
    }
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
      <div className="relative">
        <Input
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        {filteredParticipants.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <ul>
              {filteredParticipants.map((p, index) => (
                <li
                  key={p.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-secondary ${
                    index === highlightedIndex ? "bg-secondary" : ""
                  }`}
                  onClick={() => addParticipant(p)}
                  onMouseOver={() => setHighlightedIndex(index)}
                >
                  {`${p.first_name} ${p.last_name || ''}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
