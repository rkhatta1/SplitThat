"use client";

import { useSplitEdit } from "./app-sidebar";
import { ItemizedSplitModal } from "./itemized-split-modal";
import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";
import { updateSplit, type UserShare } from "@/app/actions";

interface ManualEditModalProps {
  split: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ManualEditModal({ split, open, onOpenChange, onSuccess }: ManualEditModalProps) {
  const { data } = useSplitwiseContext();
  const [submitting, setSubmitting] = useState(false);

  const friends = data?.friends || [];
  const groups = data?.groups || [];
  const currentUser = data?.currentUser;

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState("");

  // Initialize form when split changes
  useEffect(() => {
    if (split) {
      setDescription(split.description || "");
      setAmount(split.amount?.toString() || "");
      setDate(split.date || "");
      setCurrency(split.currency || "USD");
      setNotes(split.notes || "");
      setSelectedGroup(split.groupId || "none");

      // Parse participants from the split
      if (split.participants) {
        // Include all participants (including current user if they were part of it)
        setSelectedFriends(split.participants);
      }

      // Parse userShares to find who paid
      if (split.userShares) {
        try {
          const shares = JSON.parse(split.userShares);
          const payer = shares.find((s: any) => s.paidShare > 0);
          if (payer) {
            setPaidBy(payer.odId);
          }
        } catch (e) {
          if (currentUser) {
            setPaidBy(currentUser.id.toString());
          }
        }
      } else if (currentUser) {
        setPaidBy(currentUser.id.toString());
      }
    }
  }, [split, currentUser]);

  // Filter friends based on selected group
  const filteredFriends =
    selectedGroup && selectedGroup !== "none"
      ? friends.filter((friend) => {
          const group = groups.find((g) => g.id.toString() === selectedGroup);
          if (!group?.members) return false;
          return group.members.some((m: any) => m.id === friend.id);
        })
      : friends;

  // Build list of potential payers
  const potentialPayers = [
    ...(currentUser
      ? [{ id: currentUser.id.toString(), name: "Me", isCurrentUser: true }]
      : []),
    ...selectedFriends.map((friendId) => {
      const friend = friends.find((f) => f.id.toString() === friendId);
      return friend
        ? { id: friend.id.toString(), name: friend.first_name, isCurrentUser: false }
        : null;
    }).filter(Boolean) as { id: string; name: string; isCurrentUser: boolean }[],
  ];

  const toggleFriend = (friendId: string) => {
    const newSelection = selectedFriends.includes(friendId)
      ? selectedFriends.filter((id) => id !== friendId)
      : [...selectedFriends, friendId];
    setSelectedFriends(newSelection);

    // If removing the current payer, reset to current user
    if (!newSelection.includes(paidBy) && paidBy !== currentUser?.id.toString()) {
      setPaidBy(currentUser?.id.toString() || "");
    }
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    if (groupId && groupId !== "none") {
      const group = groups.find((g) => g.id.toString() === groupId);
      if (group?.members) {
        const memberIds = group.members.map((m: any) => m.id.toString());
        const newFriends = selectedFriends.filter((id) =>
          memberIds.includes(id)
        );
        setSelectedFriends(newFriends);

        if (!newFriends.includes(paidBy) && paidBy !== currentUser?.id.toString()) {
          setPaidBy(currentUser?.id.toString() || "");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      toast.error("Please fill in required fields");
      return;
    }

    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend to split with");
      return;
    }

    setSubmitting(true);
    try {
      const amountNum = parseFloat(amount);

      // Build user shares - equal split among selected participants only
      const allParticipantIds = selectedFriends.filter(Boolean) as string[];

      if (allParticipantIds.length === 0) {
        toast.error("Please select at least one participant");
        setSubmitting(false);
        return;
      }

      const sharePerPerson = amountNum / allParticipantIds.length;

      const userShares: UserShare[] = allParticipantIds.map((id) => {
        const friend = friends.find((f) => f.id.toString() === id);
        const isCurrentUser = id === currentUser?.id.toString();
        const name = isCurrentUser ? "Me" : friend?.first_name || "Unknown";

        return {
          odId: id,
          name,
          owedShare: sharePerPerson,
          paidShare: id === paidBy ? amountNum : 0,
        };
      });

      // If the payer is not in the participant list, add them with owedShare: 0
      const payerInParticipants = allParticipantIds.includes(paidBy);
      if (!payerInParticipants && paidBy) {
        const payerFriend = friends.find((f) => f.id.toString() === paidBy);
        const isPayerCurrentUser = paidBy === currentUser?.id.toString();
        const payerName = isPayerCurrentUser ? "Me" : payerFriend?.first_name || "Unknown";

        userShares.push({
          odId: paidBy,
          name: payerName,
          owedShare: 0, // Payer doesn't owe anything if not a participant
          paidShare: amountNum,
        });
      }

      // Get the splitwiseId
      const splitwiseId = split.splitwiseId;
      if (!splitwiseId) {
        throw new Error("No Splitwise ID found for this split");
      }

      // Update on both Splitwise and Convex
      await updateSplit({
        splitId: split._id,
        splitwiseId,
        amount: amountNum,
        description,
        date,
        currency,
        notes,
        groupId: selectedGroup && selectedGroup !== "none" ? selectedGroup : undefined,
        userShares,
        payerId: paidBy,
      });

      toast.success("Split updated on Splitwise!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update split");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Split</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="Lunch at Chipotle"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group">Group (Optional)</Label>
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
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

          <div className="space-y-2">
            <Label className="hidden md:block">Split with</Label>
            <ScrollArea className="h-32 rounded-md border p-2">
              {filteredFriends.length === 0 && !currentUser ? (
                <p className="text-sm text-muted-foreground">
                  {selectedGroup && selectedGroup !== "none"
                    ? "No friends in this group"
                    : "No friends found"}
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Current user option */}
                  {currentUser && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-friend-me"
                        checked={selectedFriends.includes(currentUser.id.toString())}
                        onCheckedChange={() => toggleFriend(currentUser.id.toString())}
                      />
                      <label
                        htmlFor="edit-friend-me"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Me ({currentUser.first_name})
                      </label>
                    </div>
                  )}
                  {filteredFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-friend-${friend.id}`}
                        checked={selectedFriends.includes(friend.id.toString())}
                        onCheckedChange={() => toggleFriend(friend.id.toString())}
                      />
                      <label
                        htmlFor={`edit-friend-${friend.id}`}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update Split"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditSplitModal() {
  const { editingSplit, setEditingSplit } = useSplitEdit();

  // Transform the split data from DB format to ItemizedData format (for auto splits)
  const itemizedData = useMemo(() => {
    if (!editingSplit || editingSplit.type !== "auto") return null;

    // Parse stored JSON strings
    let items: { name: string; amount: number; quantity?: number; assignedTo?: string[] }[] = [];
    let userShares: { odId: string; name: string; owedShare: number; paidShare: number }[] = [];

    try {
      if (editingSplit.items) {
        const parsedItems = JSON.parse(editingSplit.items);
        items = parsedItems.map((item: any) => ({
          name: item.name,
          amount: item.amount,
          quantity: item.quantity,
          assignedTo: item.assignedTo,
        }));
      }
    } catch (e) {
      console.error("Failed to parse items:", e);
    }

    try {
      if (editingSplit.userShares) {
        userShares = JSON.parse(editingSplit.userShares);
      }
    } catch (e) {
      console.error("Failed to parse userShares:", e);
    }

    // Get selected friend IDs from user shares (exclude current user)
    const selectedFriends = userShares
      .filter((share) => share.paidShare === 0) // Friends didn't pay
      .map((share) => share.odId);

    return {
      title: editingSplit.description,
      date: editingSplit.date,
      total: editingSplit.amount,
      tax: editingSplit.tax || 0,
      tip: editingSplit.tip || 0,
      currency: "USD",
      items,
      selectedGroup: editingSplit.groupId || undefined,
      selectedFriends,
      // Pass the split ID for updating
      splitId: editingSplit._id,
      splitwiseId: editingSplit.splitwiseId,
    };
  }, [editingSplit]);

  if (!editingSplit) return null;

  // For manual splits, show the manual edit modal
  if (editingSplit.type === "manual") {
    return (
      <ManualEditModal
        split={editingSplit}
        open={!!editingSplit}
        onOpenChange={(open) => {
          if (!open) setEditingSplit(null);
        }}
        onSuccess={() => {
          setEditingSplit(null);
        }}
      />
    );
  }

  // For auto splits, show the itemized modal
  if (!itemizedData) return null;

  return (
    <ItemizedSplitModal
      data={itemizedData}
      open={!!editingSplit}
      onOpenChange={(open) => {
        if (!open) setEditingSplit(null);
      }}
      onSuccess={() => {
        setEditingSplit(null);
      }}
      editMode={true}
      splitId={editingSplit._id}
    />
  );
}
