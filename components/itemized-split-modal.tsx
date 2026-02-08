"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useEffect, useState, useMemo } from "react";
import { createSplit, updateSplit, type UserShare, type SplitItem } from "@/app/actions";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

interface EditableItem {
  name: string;
  amount: number;
  quantity?: number;
  assignedTo?: string[];
  suggestedParticipants?: string[]; // AI-suggested participants based on instructions
}

interface ItemizedData {
  title?: string;
  restaurantName?: string;
  date?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  currency: string;
  items: EditableItem[];
  selectedGroup?: string;
  selectedFriends?: string[];
  payerId?: string; // Who paid the bill (for edit mode)
  userNotes?: string; // User's custom notes (for edit mode)
}

interface ItemizedSplitModalProps {
  data: ItemizedData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editMode?: boolean;
  splitId?: Id<"splits">;
}

export function ItemizedSplitModal({
  data,
  open,
  onOpenChange,
  onSuccess,
  editMode = false,
  splitId,
}: ItemizedSplitModalProps) {
  const { data: splitwiseData } = useSplitwiseContext();
  const allFriends = splitwiseData?.friends || [];
  const groups = splitwiseData?.groups || [];
  const currentUser = splitwiseData?.currentUser;
  const updateSplitMutation = useMutation(api.splits.updateSplit);

  // Filter to only show selected friends from the auto form
  const friends = useMemo(() =>
    data.selectedFriends
      ? allFriends.filter((f) =>
          data.selectedFriends!.includes(f.id.toString())
        )
      : allFriends,
    [allFriends, data.selectedFriends]
  );

  // Build participant list (current user + selected friends)
  const participants = useMemo(() => [
    ...(currentUser
      ? [{
          id: currentUser.id.toString(),
          name: currentUser.first_name,
          picture: currentUser.picture?.small as string | undefined,
          isCurrentUser: true,
        }]
      : []),
    ...friends.map((f) => ({
      id: f.id.toString(),
      name: f.first_name,
      picture: f.picture?.small as string | undefined,
      isCurrentUser: false,
    })),
  ], [currentUser, friends]);

  // Editable items state
  const [items, setItems] = useState<EditableItem[]>([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paidBy, setPaidBy] = useState<string>("");

  // Initialize state when data changes
  useEffect(() => {
    // Set items
    setItems(data.items?.map((item) => ({
      name: item.name,
      amount: item.amount,
      quantity: item.quantity,
      assignedTo: item.assignedTo,
    })) || []);

    // Set tax and tip
    setTax(data.tax || 0);
    setTip(data.tip || 0);
    setCurrency(data.currency || "USD");
    setDate(data.date || new Date().toISOString().split("T")[0]);
    setSelectedGroup(data.selectedGroup || "none");

    // Load user's custom notes if available (edit mode)
    setNotes(data.userNotes || "");

    // Set paidBy: use stored payerId if available (edit mode), otherwise default to current user
    if (data.payerId) {
      setPaidBy(data.payerId);
    } else if (currentUser) {
      setPaidBy(currentUser.id.toString());
    }

    // Initialize selections
    // Compute participant IDs directly to avoid circular dependency
    const participantIds: string[] = [];
    if (currentUser) {
      participantIds.push(currentUser.id.toString());
    }
    friends.forEach((f) => {
      participantIds.push(f.id.toString());
    });

    const initial: Record<number, string[]> = {};
    data.items?.forEach((item, idx) => {
      // Priority: 1) stored assignedTo (edit mode), 2) AI-suggested, 3) all participants
      if (item.assignedTo && item.assignedTo.length > 0) {
        initial[idx] = [...item.assignedTo];
      } else if (item.suggestedParticipants && item.suggestedParticipants.length > 0) {
        // Map AI-suggested participant names to IDs
        const suggestedIds: string[] = [];
        item.suggestedParticipants.forEach((name) => {
          const nameLower = name.toLowerCase();
          // Check if it's the current user
          if (currentUser && currentUser.first_name.toLowerCase() === nameLower) {
            suggestedIds.push(currentUser.id.toString());
          } else {
            // Find matching friend by name
            const friend = friends.find(
              (f) => f.first_name.toLowerCase() === nameLower
            );
            if (friend) {
              suggestedIds.push(friend.id.toString());
            }
          }
        });
        // Use suggested IDs if any matched, otherwise fall back to all
        initial[idx] = suggestedIds.length > 0 ? suggestedIds : [...participantIds];
      } else {
        initial[idx] = [...participantIds];
      }
    });
    setSelections(initial);
  }, [data, currentUser, friends]);

  // Calculate subtotal from items
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [items]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + tax + tip;
  }, [subtotal, tax, tip]);

  // Calculate per-person breakdown
  const perPersonBreakdown = useMemo(() => {
    const breakdown: Record<string, { items: number; tax: number; tip: number; total: number }> = {};

    // Initialize breakdown for all participants
    participants.forEach((p) => {
      breakdown[p.id] = { items: 0, tax: 0, tip: 0, total: 0 };
    });

    // Calculate item shares
    items.forEach((item, idx) => {
      const selectedIds = selections[idx] || [];
      if (selectedIds.length === 0) return;

      const share = item.amount / selectedIds.length;
      selectedIds.forEach((id) => {
        if (breakdown[id]) {
          breakdown[id].items += share;
        }
      });
    });

    // Calculate tax and tip proportionally based on item participation
    const totalItemsPerPerson: Record<string, number> = {};
    let grandTotalItems = 0;

    participants.forEach((p) => {
      totalItemsPerPerson[p.id] = breakdown[p.id].items;
      grandTotalItems += breakdown[p.id].items;
    });

    // Distribute tax and tip proportionally
    if (grandTotalItems > 0) {
      participants.forEach((p) => {
        const proportion = totalItemsPerPerson[p.id] / grandTotalItems;
        breakdown[p.id].tax = tax * proportion;
        breakdown[p.id].tip = tip * proportion;
        breakdown[p.id].total =
          breakdown[p.id].items + breakdown[p.id].tax + breakdown[p.id].tip;
      });
    }

    return breakdown;
  }, [items, selections, tax, tip, participants]);

  const updateItemName = (idx: number, name: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], name };
      return updated;
    });
  };

  const updateItemAmount = (idx: number, amount: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], amount: isNaN(amount) ? 0 : amount };
      return updated;
    });
  };

  const toggleSelection = (itemIdx: number, participantId: string) => {
    setSelections((prev) => {
      const current = prev[itemIdx] || [];
      if (current.includes(participantId)) {
        return { ...prev, [itemIdx]: current.filter((id) => id !== participantId) };
      } else {
        return { ...prev, [itemIdx]: [...current, participantId] };
      }
    });
  };

  const selectAllForItem = (itemIdx: number) => {
    setSelections((prev) => ({
      ...prev,
      [itemIdx]: participants.map((p) => p.id),
    }));
  };

  const deleteItem = (idx: number) => {
    // Remove the item
    setItems((prev) => prev.filter((_, i) => i !== idx));

    // Re-index selections (shift all indices after deleted item down by 1)
    setSelections((prev) => {
      const updated: Record<number, string[]> = {};
      Object.keys(prev).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum < idx) {
          updated[keyNum] = prev[keyNum];
        } else if (keyNum > idx) {
          updated[keyNum - 1] = prev[keyNum];
        }
        // Skip the deleted index
      });
      return updated;
    });
  };

  const handlePublish = async () => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    const hasSelections = Object.values(selections).some((s) => s.length > 0);
    if (!hasSelections) {
      toast.error("Please assign at least one item to a participant");
      return;
    }

    setSubmitting(true);

    try {
      // Format details with per-person breakdown
      let details = `Receipt: ${data.title || data.restaurantName || "Itemized Split"}\n\n`;
      details += "Item Breakdown:\n";

      items.forEach((item, idx) => {
        const selectedNames = (selections[idx] || [])
          .map((id) => {
            const p = participants.find((p) => p.id === id);
            return p ? (p.isCurrentUser ? "Me" : p.name) : "Unknown";
          })
          .join(", ");
        details += `• ${item.name}: $${item.amount.toFixed(2)} → ${selectedNames || "Unassigned"}\n`;
      });

      details += `\nTax: $${tax.toFixed(2)}\n`;
      details += `Tip: $${tip.toFixed(2)}\n`;
      details += `\nPer Person Totals:\n`;

      participants.forEach((p) => {
        const bd = perPersonBreakdown[p.id];
        if (bd && bd.total > 0) {
          details += `• ${p.isCurrentUser ? "Me" : p.name}: $${bd.total.toFixed(2)} (items: $${bd.items.toFixed(2)}, tax: $${bd.tax.toFixed(2)}, tip: $${bd.tip.toFixed(2)})\n`;
        }
      });

      // Build user shares for Splitwise API
      // The selected payer paid the full amount, everyone owes their share
      const userShares: UserShare[] = [];

      participants.forEach((p) => {
        const bd = perPersonBreakdown[p.id];
        if (bd && bd.total > 0) {
          userShares.push({
            odId: p.id,
            name: p.name,
            // Round to 2 decimal places for currency
            owedShare: Math.round(bd.total * 100) / 100,
            paidShare: p.id === paidBy ? total : 0, // Selected payer paid the whole bill
          });
        }
      });

      // If the payer is not in the participants list (no items assigned), add them with owedShare: 0
      const payerInShares = userShares.find((share) => share.odId === paidBy);
      if (!payerInShares && paidBy) {
        const payer = participants.find((p) => p.id === paidBy);
        if (payer) {
          userShares.push({
            odId: payer.id,
            name: payer.name,
            owedShare: 0, // Payer doesn't owe anything if they have no items
            paidShare: total,
          });
        }
      }

      // Fix rounding errors: ensure owed shares sum exactly to total
      // Splitwise requires the sum of owed shares to equal the total cost
      const owedSum = userShares.reduce((sum, s) => sum + s.owedShare, 0);
      const roundedTotal = Math.round(total * 100) / 100;
      const difference = Math.round((roundedTotal - owedSum) * 100) / 100;

      if (difference !== 0 && userShares.length > 0) {
        // Find the share with the largest owed amount and adjust it
        const largestShare = userShares.reduce((max, s) =>
          s.owedShare > max.owedShare ? s : max, userShares[0]);
        largestShare.owedShare = Math.round((largestShare.owedShare + difference) * 100) / 100;
      }

      // Build items for database storage
      const splitItems: SplitItem[] = items.map((item, idx) => ({
        name: item.name,
        amount: item.amount,
        assignedTo: selections[idx] || [],
      }));

      if (editMode && splitId) {
        // Extract participant IDs from userShares
        const participantIds = userShares.map((share) => share.odId);

        // Get the splitwiseId from the split data
        const splitwiseId = (data as any).splitwiseId;
        if (!splitwiseId) {
          throw new Error("No Splitwise ID found for this split");
        }

        // Update on both Splitwise and Convex
        await updateSplit({
          splitId,
          splitwiseId,
          amount: total,
          description: data.title || data.restaurantName || "AI Itemized Split",
          date,
          currency,
          userNotes: notes, // User's custom notes
          details, // Auto-generated breakdown (regenerated each time)
          groupId: selectedGroup && selectedGroup !== "none" ? selectedGroup : undefined,
          items: splitItems,
          userShares,
          tax,
          tip,
          payerId: paidBy,
        });
        toast.success("Split updated on Splitwise!");
      } else {
        // Create new split
        await createSplit({
          description: data.title || data.restaurantName || "AI Itemized Split",
          amount: total,
          date,
          currency,
          userNotes: notes, // User's custom notes
          details, // Auto-generated breakdown
          groupId: selectedGroup && selectedGroup !== "none" ? selectedGroup : undefined,
          type: "auto",
          userShares,
          items: splitItems,
          tax,
          tip,
          payerId: paidBy,
        });
        toast.success("Split published to Splitwise!");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish split");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[75%] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row gap-2 items-center">
          <DialogTitle>
            {editMode ? "Edit Split: " : ""}{data.title || data.restaurantName || "Itemized Split"}
          </DialogTitle>
          <span className="text-xs opacity-50">•</span>
          <div className="flex items-center gap-2">
            <Label className="hidden md:block text-xs text-muted-foreground">Date:</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-7 w-36 text-xs"
            />
          </div>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No items found in receipt
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {/* Mobile Layout - Card based */}
            <div className="md:hidden overflow-auto flex flex-col max-h-[48vh] no-scrollbar space-y-1 py-3">
              {items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-2 space-y-1.5">
                  {/* Row 1: Item name, Amount, Delete button */}
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItemName(idx, e.target.value)}
                      className="h-7 text-xs flex-1"
                      placeholder="Item name"
                    />
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-0.5 text-xs">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount || ""}
                        onChange={(e) => updateItemAmount(idx, parseFloat(e.target.value))}
                        className="h-7 text-xs w-16"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(idx)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete item"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                  {/* Row 2: Participant pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {participants.map((participant) => (
                      <button
                        key={participant.id}
                        type="button"
                        onClick={() => toggleSelection(idx, participant.id)}
                        className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                          selections[idx]?.includes(participant.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                        title={participant.name}
                      >
                        {participant.isCurrentUser ? (
                          <span>Me</span>
                        ) : (
                          <>
                            <Avatar className="h-3.5 w-3.5">
                              <AvatarImage src={participant.picture} />
                              <AvatarFallback className="text-[6px]">
                                {participant.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{participant.name}</span>
                          </>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => selectAllForItem(idx)}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted hover:bg-muted/80 text-muted-foreground"
                    >
                      All
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Layout - Table based */}
            <div className="hidden md:block overflow-auto max-h-[50vh] no-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[50%]">Item</TableHead>
                    <TableHead className="w-[15%]">Amount</TableHead>
                    <TableHead>Who&apos;s paying?</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItemName(idx, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.amount || ""}
                            onChange={(e) => updateItemAmount(idx, parseFloat(e.target.value))}
                            className="h-8 text-sm w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {participants.map((participant) => (
                            <button
                              key={participant.id}
                              type="button"
                              onClick={() => toggleSelection(idx, participant.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                selections[idx]?.includes(participant.id)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                              title={participant.name}
                            >
                              {participant.isCurrentUser ? (
                                <span>Me</span>
                              ) : (
                                <>
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={participant.picture} />
                                    <AvatarFallback className="text-[8px]">
                                      {participant.name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{participant.name}</span>
                                </>
                              )}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => selectAllForItem(idx)}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground"
                          >
                            All
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => deleteItem(idx)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete item"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="pt-2 md:pt-4 border-t space-y-2 md:space-y-4">
          {/* Mobile Footer Layout */}
          <div className="md:hidden space-y-2">
            {/* Subtotal, Tax, Tip */}
            <div className="flex flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Tax</span>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-0.5">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={tax || ""}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    className="py-0.5 text-xs h-7"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Tip</span>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-0.5">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={tip || ""}
                    onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                    className="text-xs py-0.5 h-7"
                  />
                </div>
              </div>
            </div>

            {/* Total and Paid by selector in same row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-bold text-sm">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD" className="text-xs">USD</SelectItem>
                    <SelectItem value="EUR" className="text-xs">EUR</SelectItem>
                    <SelectItem value="GBP" className="text-xs">GBP</SelectItem>
                    <SelectItem value="INR" className="text-xs">INR</SelectItem>
                    <SelectItem value="CAD" className="text-xs">CAD</SelectItem>
                    <SelectItem value="AUD" className="text-xs">AUD</SelectItem>
                    <SelectItem value="JPY" className="text-xs">JPY</SelectItem>
                    <SelectItem value="CNY" className="text-xs">CNY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            {/* Paid by selector */}
            <div className="flex items-center justify-start gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Paid by</Label>
              <div className="flex items-center gap-1.5">
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.isCurrentUser ? "Me" : p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>

            {/* Notes field */}
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          {/* Desktop Footer Layout */}
          <div className="hidden md:block">
            <div className="flex flex-row justify-between">
              {/* Calculated Subtotal and Total */}
              <div className="flex flex-row gap-6 text-sm">
                <div className="flex justify-start items-center gap-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-row gap-6">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Paid by</Label>
                  <Select value={paidBy} onValueChange={setPaidBy}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.isCurrentUser ? "Me" : p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 justify-start">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={tax || ""}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      className="py-2 text-sm w-18"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tip</span>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={tip || ""}
                      onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                      className="text-sm py-2 w-18"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes field */}
          <div className="hidden md:flex md:flex-col space-y-2">
            <Label className="text-sm">Notes</Label>
            <Textarea
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Per Person Breakdown */}
          {participants.length > 0 && (
            <div className="space-y-2">
              <p className="hidden md:block md:text-sm font-medium">Per Person</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {participants.map((p) => {
                  const bd = perPersonBreakdown[p.id];
                  if (!bd || bd.total === 0) return null;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                    >
                      {p.isCurrentUser ? (
                        <span className="text-xs font-medium">Me</span>
                      ) : (
                        <Avatar className="h-4 w-4 md:h-5 md:w-5">
                          <AvatarImage src={p.picture} />
                          <AvatarFallback className="text-[8px]">
                            {p.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs md:text-sm">{p.isCurrentUser ? "" : p.name}</span>
                      <span className="ml-auto font-medium text-xs md:text-sm">
                        ${bd.total.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={submitting}>
              {submitting
                ? (editMode ? "Updating..." : "Publishing...")
                : (editMode ? "Update Split" : "Publish to Splitwise")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
