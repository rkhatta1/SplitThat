"use client";

import { useEffect, useState } from "react";
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
import { getSplitwiseData } from "@/app/actions";
import { toast } from "sonner";

export function ManualSplitForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSplitwiseData();
        if (data) {
          setFriends(data.friends);
          setGroups(data.groups);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement split creation in Splitwise and Convex
    toast.success("Split created successfully!");
    setSubmitting(false);
    onSuccess();
  };

  if (loading) return <div className="p-4 text-center">Loading data...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Lunch at Chipotle" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="group">Group (Optional)</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Comments</Label>
        <Textarea placeholder="Add a note..." />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating..." : "Create Split"}
      </Button>
    </form>
  );
}
