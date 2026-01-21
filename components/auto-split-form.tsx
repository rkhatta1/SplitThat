"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { ItemizedSplitModal } from "./itemized-split-modal";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SharedFormState } from "./new-split-modal";

interface AutoSplitFormProps {
  onSuccess: () => void;
  formState: SharedFormState;
  updateFormState: (updates: Partial<SharedFormState>) => void;
}

export function AutoSplitForm({
  onSuccess,
  formState,
  updateFormState,
}: AutoSplitFormProps) {
  const { data: splitwiseData } = useSplitwiseContext();
  const [processing, setProcessing] = useState(false);
  const [itemizedData, setItemizedData] = useState<any>(null);

  const friends = splitwiseData?.friends || [];
  const groups = splitwiseData?.groups || [];
  const currentUser = splitwiseData?.currentUser;

  // Filter friends based on selected group
  const filteredFriends = formState.selectedGroup && formState.selectedGroup !== "none"
    ? friends.filter((friend) => {
        const group = groups.find((g) => g.id.toString() === formState.selectedGroup);
        if (!group?.members) return false;
        return group.members.some((m: any) => m.id === friend.id);
      })
    : friends;

  const toggleFriend = (friendId: string) => {
    const newSelection = formState.selectedFriends.includes(friendId)
      ? formState.selectedFriends.filter((id) => id !== friendId)
      : [...formState.selectedFriends, friendId];
    updateFormState({ selectedFriends: newSelection });
  };

  // When group changes, reset friend selection to only include group members
  const handleGroupChange = (groupId: string) => {
    updateFormState({ selectedGroup: groupId });
    if (groupId && groupId !== "none") {
      const group = groups.find((g) => g.id.toString() === groupId);
      if (group?.members) {
        const memberIds = group.members.map((m: any) => m.id.toString());
        updateFormState({
          selectedFriends: formState.selectedFriends.filter((id) =>
            memberIds.includes(id)
          ),
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateFormState({ file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.file) return;

    if (formState.selectedFriends.length === 0) {
      toast.error("Please select at least one friend to split with");
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append("file", formState.file);

    // Build participants list with names
    const participantNames: string[] = [];
    if (currentUser) {
      participantNames.push(currentUser.first_name);
    }
    formState.selectedFriends.forEach((friendId) => {
      const friend = friends.find((f) => f.id.toString() === friendId);
      if (friend) {
        participantNames.push(friend.first_name);
      }
    });
    formData.append("participants", JSON.stringify(participantNames));

    if (formState.splitInstructions) {
      formData.append("splitInstructions", formState.splitInstructions);
    }

    try {
      const response = await fetch("/api/ai/process-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process receipt");
      }

      const result = await response.json();

      // Add metadata for the modal
      setItemizedData({
        ...result,
        title: formState.title || result.restaurantName || "Receipt Split",
        selectedGroup: formState.selectedGroup,
        selectedFriends: formState.selectedFriends,
      });

      toast.success("Receipt processed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process receipt");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-2 md:space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-[0.75rem]" htmlFor="title">Description</Label>
          <Input
          className="text-[0.75rem]"
            id="title"
            placeholder="Dinner at Mario's"
            value={formState.title}
            onChange={(e) => updateFormState({ title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-[0.75rem]" htmlFor="group">Group (Optional)</Label>
          <Select value={formState.selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="w-full">
              <SelectValue className="text-[0.75rem]" placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No group (individual friends)</SelectItem>
              {groups.map((g) => (
                <SelectItem className="text-[0.75rem]" key={g.id} value={g.id.toString()}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:space-y-2">
          <Label className="text-[0.75rem]" htmlFor="auto-date">Date</Label>
          <Input
          className="text-[0.75rem]"
            id="auto-date"
            type="date"
            value={formState.date}
            onChange={(e) => updateFormState({ date: e.target.value })}
          />
        </div>
        </div>

        <div className="space-y-1 md:space-y-2">
          <Label className="text-[0.75rem]">Split with</Label>
          <ScrollArea className="h-24 md:h-32 rounded-md border p-2">
            {filteredFriends.length === 0 ? (
              <p className="text-[0.75rem] md:text-sm text-muted-foreground">
                {formState.selectedGroup && formState.selectedGroup !== "none"
                  ? "No friends in this group"
                  : "No friends found"}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`auto-friend-${friend.id}`}
                      checked={formState.selectedFriends.includes(friend.id.toString())}
                      onCheckedChange={() => toggleFriend(friend.id.toString())}
                    />
                    <label
                      htmlFor={`auto-friend-${friend.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {friend.first_name} {friend.last_name || ""}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="space-y-1 md:space-y-2">
          <Label className="text-[0.75rem]" htmlFor="splitInstructions">Split Instructions (Optional)</Label>
          <Textarea
          className="text-[0.75rem]"
            id="splitInstructions"
            placeholder="e.g., Ben is vegetarian, Sarah didn't have dessert, split appetizers equally..."
            value={formState.splitInstructions}
            onChange={(e) => updateFormState({ splitInstructions: e.target.value })}
            rows={3}
          />
        </div>

        <div className="border-2 border-dashed rounded-lg p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 bg-muted/50">
          <HugeiconsIcon
            icon={File01Icon}
            size={32}
            className="hidden md:block text-muted-foreground"
          />
          <HugeiconsIcon
            icon={File01Icon}
            size={22}
            className="md:hidden text-muted-foreground"
          />
          <div className="text-center">
            <p className="text-sm font-medium">Upload receipt</p>
            <p className="text-xs text-muted-foreground">
              PDF, PNG, JPG (max 5MB)
            </p>
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
            className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Select File
          </Label>
          {formState.file && (
            <p className="text-sm text-primary font-medium">{formState.file.name}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={!formState.file || formState.selectedFriends.length === 0 || processing}
        >
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
          onOpenChange={(open: boolean) => {
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
