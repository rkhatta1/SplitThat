"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ManualSplitForm } from "./manual-split-form";
import { AutoSplitForm } from "./auto-split-form";

interface NewSplitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSplitModal({ open, onOpenChange }: NewSplitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Split</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="auto">Auto (AI)</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
            <ManualSplitForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="auto" className="mt-4">
            <AutoSplitForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
