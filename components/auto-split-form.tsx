"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { processReceipt } from "@/app/actions-ai";
import { toast } from "sonner";
import { ItemizedSplitModal } from "./itemized-split-modal";

export function AutoSplitForm({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [itemizedData, setItemizedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await processReceipt(formData);
      setItemizedData(result);
      toast.success("Receipt processed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process receipt");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 bg-muted/50">
          <HugeiconsIcon icon={File01Icon} size={40} className="text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PDF, PNG, JPG (max 5MB)</p>
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          <Label
            htmlFor="file-upload"
            className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Select File
          </Label>
          {file && (
            <p className="text-sm text-primary font-medium">{file.name}</p>
          )}
        </div>

        <Button type="submit" className="w-full gap-2" disabled={!file || processing}>
          {processing ? (
            "Processing with AI..."
          ) : (
            <>
              <HugeiconsIcon icon={ZapIcon} size={18} />
              Process Receipt
            </>
          )}
        </Button>
      </form>

      {itemizedData && (
        <ItemizedSplitModal
          data={itemizedData}
          open={!!itemizedData}
          onOpenChange={(open) => {
            if (!open) setItemizedData(null);
          }}
          onSuccess={() => {
            setItemizedData(null);
            onSuccess();
          }}
        />
      )}
    </div>
  );
}
