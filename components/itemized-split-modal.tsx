"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useEffect, useState } from "react";
import { createSplit, getSplitwiseData } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function ItemizedSplitModal({
  data,
  open,
  onOpenChange,
  onSuccess,
}: ItemizedSplitModalProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getSplitwiseData();
      if (res) {
        setFriends(res.friends);
        setCurrentUser(res.currentUser);
      }
    }
    loadData();
    
    const initial: Record<number, string[]> = {};
    data.items.forEach((_, idx) => {
      // By default, only current user is selected if nothing else?
      // Or let's just keep it empty.
      initial[idx] = [];
    });
    setSelections(initial);
  }, [data]);

  const handlePublish = async () => {
    if (!currentUser) return;
    setSubmitting(true);

    try {
      // Calculate shares
      const userOwed: Record<string, number> = {};
      
      data.items.forEach((item, idx) => {
        const selectedIds = selections[idx] || [];
        if (selectedIds.length === 0) return;
        
        const share = item.amount / selectedIds.length;
        selectedIds.forEach((id) => {
          userOwed[id] = (userOwed[id] || 0) + share;
        });
      });

      // Construct users array for Splitwise
      const swUsers: any[] = [];
      
      // The current user paid everything
      swUsers.push({
        user_id: currentUser.id,
        paid_share: data.total.toFixed(2),
        owed_share: (userOwed[currentUser.id.toString()] || 0).toFixed(2),
      });

      // Add other friends
      Object.entries(userOwed).forEach(([id, amount]) => {
        if (id === currentUser.id.toString()) return;
        swUsers.push({
          user_id: parseInt(id),
          paid_share: "0.00",
          owed_share: amount.toFixed(2),
        });
      });

      // Format details (comments)
      let details = "Itemized Breakdown:\n";
      data.items.forEach((item, idx) => {
        const selectedNames = (selections[idx] || [])
          .map((id) => {
            if (id === currentUser.id.toString()) return "Me";
            const f = friends.find((f) => f.id.toString() === id);
            return f ? f.first_name : "Unknown";
          })
          .join(", ");
        details += `- ${item.name}: ${item.amount.toFixed(2)} (${selectedNames || "No one selected"})\n`;
      });

      await createSplit({
        description: "AI Itemized Split",
        amount: data.total,
        date: new Date().toISOString().split("T")[0],
        users: swUsers,
        details,
        type: "auto",
      });

      toast.success("Split published to Splitwise!");
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
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Itemized Split</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-[100px]">Amount</TableHead>
                <TableHead>Participants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {/* Current User */}
                      {currentUser && (
                        <div
                          onClick={() => toggleSelection(idx, currentUser.id.toString())}
                          className={`flex items-center gap-1 p-1 rounded-full cursor-pointer border transition-colors ${
                            selections[idx]?.includes(currentUser.id.toString())
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/50 border-transparent hover:border-muted-foreground"
                          }`}
                          title="Me"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={currentUser.picture?.small} />
                            <AvatarFallback>ME</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          onClick={() => toggleSelection(idx, friend.id.toString())}
                          className={`flex items-center gap-1 p-1 rounded-full cursor-pointer border transition-colors ${
                            selections[idx]?.includes(friend.id.toString())
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/50 border-transparent hover:border-muted-foreground"
                          }`}
                          title={friend.first_name}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={friend.picture?.small} />
                            <AvatarFallback>{friend.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="py-4 border-t flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${data.total.toFixed(2)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish to Splitwise"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
