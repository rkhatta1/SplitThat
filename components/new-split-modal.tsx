"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useCallback } from "react";
import { ManualSplitForm } from "./manual-split-form";
import { AutoSplitForm } from "./auto-split-form";

interface NewSplitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Shared form state that persists across tab switches
export interface SharedFormState {
  selectedGroup: string;
  selectedFriends: string[];
  description: string;
  amount: string;
  date: string;
  currency: string;
  notes: string;
  paidBy: string; // Who paid the bill
  // Auto-specific
  title: string;
  splitInstructions: string;
  file: File | null;
}

const initialFormState: SharedFormState = {
  selectedGroup: "",
  selectedFriends: [],
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  currency: "USD",
  notes: "",
  paidBy: "", // Will be set to current user when component mounts
  title: "",
  splitInstructions: "",
  file: null,
};

export function NewSplitModal({ open, onOpenChange }: NewSplitModalProps) {
  const [formState, setFormState] = useState<SharedFormState>(initialFormState);

  const updateFormState = useCallback((updates: Partial<SharedFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form state when modal closes
      setFormState(initialFormState);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[30vw]">
        <DialogHeader>
          <DialogTitle>Create New Split</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Auto (AI)</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="auto" className="mt-4">
            <AutoSplitForm
              onSuccess={() => handleOpenChange(false)}
              formState={formState}
              updateFormState={updateFormState}
            />
          </TabsContent>
          <TabsContent value="manual" className="mt-4">
            <ManualSplitForm
              onSuccess={() => handleOpenChange(false)}
              formState={formState}
              updateFormState={updateFormState}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
