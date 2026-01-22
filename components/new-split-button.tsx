"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { NewSplitModal } from "./new-split-modal";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

export function NewSplitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show the button on login page or if not authenticated
  if (!session || pathname === "/app/login") {
    return null;
  }

  return (
    <>
      {/* Mobile: bottom-right, icon only */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-none shadow-lg cursor-pointer hover:scale-110 transition-transform"
        >
          <HugeiconsIcon icon={Add01Icon} size={24} />
        </Button>
      </div>
      {/* Desktop: top-center, with text */}
      <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-none shadow-lg cursor-pointer py-6 px-6 items-center hover:scale-105 transition-transform"
        >
          <HugeiconsIcon icon={Add01Icon} size={22} />
          <span className="text-md">New Split</span>
        </Button>
      </div>
      <NewSplitModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
