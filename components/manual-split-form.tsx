"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { createSplit, type UserShare } from "@/app/actions";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SharedFormState } from "./new-split-modal";

interface ManualSplitFormProps {
  onSuccess: () => void;
  formState: SharedFormState;
  updateFormState: (updates: Partial<SharedFormState>) => void;
}

export function ManualSplitForm({
  onSuccess,
  formState,
  updateFormState,
}: ManualSplitFormProps) {
  const { data, isLoading } = useSplitwiseContext();
  const [submitting, setSubmitting] = useState(false);

  const friends = data?.friends || [];
  const groups = data?.groups || [];
  const currentUser = data?.currentUser;

  // Set default paidBy to current user on mount
  useEffect(() => {
    if (currentUser && !formState.paidBy) {
      updateFormState({ paidBy: currentUser.id.toString() });
    }
  }, [currentUser, formState.paidBy, updateFormState]);

  // Filter friends based on selected group
  const filteredFriends =
    formState.selectedGroup && formState.selectedGroup !== "none"
      ? friends.filter((friend) => {
          const group = groups.find((g) => g.id.toString() === formState.selectedGroup);
          if (!group?.members) return false;
          return group.members.some((m: any) => m.id === friend.id);
        })
      : friends;

  // Build list of potential payers (current user + selected friends)
  const potentialPayers = [
    ...(currentUser
      ? [{ id: currentUser.id.toString(), name: "Me", isCurrentUser: true }]
      : []),
    ...formState.selectedFriends.map((friendId) => {
      const friend = friends.find((f) => f.id.toString() === friendId);
      return friend
        ? { id: friend.id.toString(), name: friend.first_name, isCurrentUser: false }
        : null;
    }).filter(Boolean) as { id: string; name: string; isCurrentUser: boolean }[],
  ];

  const toggleFriend = (friendId: string) => {
    const newSelection = formState.selectedFriends.includes(friendId)
      ? formState.selectedFriends.filter((id) => id !== friendId)
      : [...formState.selectedFriends, friendId];
    updateFormState({ selectedFriends: newSelection });

    // If removing the current payer, reset to current user
    if (!newSelection.includes(formState.paidBy) && formState.paidBy !== currentUser?.id.toString()) {
      updateFormState({ paidBy: currentUser?.id.toString() || "" });
    }
  };

  // When group changes, reset friend selection to only include group members
  const handleGroupChange = (groupId: string) => {
    updateFormState({ selectedGroup: groupId });
    if (groupId && groupId !== "none") {
      const group = groups.find((g) => g.id.toString() === groupId);
      if (group?.members) {
        const memberIds = group.members.map((m: any) => m.id.toString());
        const newFriends = formState.selectedFriends.filter((id) =>
          memberIds.includes(id)
        );
        updateFormState({ selectedFriends: newFriends });

        // Reset paidBy if not in new selection
        if (!newFriends.includes(formState.paidBy) && formState.paidBy !== currentUser?.id.toString()) {
          updateFormState({ paidBy: currentUser?.id.toString() || "" });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.description || !formState.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    if (formState.selectedFriends.length === 0) {
      toast.error("Please select at least one friend to split with");
      return;
    }

    setSubmitting(true);
    try {
      const amount = parseFloat(formState.amount);

      // Build user shares - equal split among all participants
      const allParticipantIds = [
        currentUser?.id.toString(),
        ...formState.selectedFriends,
      ].filter(Boolean) as string[];

      const sharePerPerson = amount / allParticipantIds.length;

      const userShares: UserShare[] = allParticipantIds.map((id) => {
        const friend = friends.find((f) => f.id.toString() === id);
        const name = id === currentUser?.id.toString()
          ? "Me"
          : friend?.first_name || "Unknown";

        return {
          odId: id,
          name,
          owedShare: sharePerPerson,
          paidShare: id === formState.paidBy ? amount : 0,
        };
      });

      await createSplit({
        description: formState.description,
        amount,
        date: formState.date,
        groupId: formState.selectedGroup && formState.selectedGroup !== "none" ? formState.selectedGroup : undefined,
        details: formState.notes || undefined,
        type: "manual",
        userShares,
        payerId: formState.paidBy,
      });
      toast.success("Split created successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create split");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading data...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Lunch at Chipotle"
          value={formState.description}
          onChange={(e) => updateFormState({ description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.amount}
            onChange={(e) => updateFormState({ amount: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formState.date}
            onChange={(e) => updateFormState({ date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">

      <div className="space-y-2">
        <Label htmlFor="group">Group (Optional)</Label>
        <Select value={formState.selectedGroup} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No group (individual friends)</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Paid by</Label>
        <Select value={formState.paidBy} onValueChange={(value) => updateFormState({ paidBy: value })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select who paid" />
          </SelectTrigger>
          <SelectContent>
            {potentialPayers.map((payer) => (
              <SelectItem key={payer.id} value={payer.id}>
                {payer.isCurrentUser ? "Me" : payer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>

      <div className="space-y-2">
        <Label>Split with Friends</Label>
        <ScrollArea className="h-32 rounded-md border p-2">
          {filteredFriends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {formState.selectedGroup && formState.selectedGroup !== "none"
                ? "No friends in this group"
                : "No friends found"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`manual-friend-${friend.id}`}
                    checked={formState.selectedFriends.includes(friend.id.toString())}
                    onCheckedChange={() => toggleFriend(friend.id.toString())}
                  />
                  <label
                    htmlFor={`manual-friend-${friend.id}`}
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

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Add a note..."
          value={formState.notes}
          onChange={(e) => updateFormState({ notes: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating..." : "Create Split"}
      </Button>
    </form>
  );
}
