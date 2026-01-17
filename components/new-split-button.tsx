"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { NewSplitModal } from "./new-split-modal";

export function NewSplitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg gap-2 px-6 h-11"
        >
          <HugeiconsIcon icon={Add01Icon} size={20} />
          <span>New Split</span>
        </Button>
      </div>
      <NewSplitModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
