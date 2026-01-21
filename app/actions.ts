"use server";

import { getSplitwiseClient } from "@/lib/splitwise";
import { cookies } from "next/headers";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;

  const result = await convex.query(api.auth.getSessionByToken, {
    token: sessionToken,
  });

  return result;
}

export async function getSplitwiseData() {
  const session = await getSession();
  if (!session) return null;

  const token = await convex.query(api.auth.getAccessToken, {
    userId: session.user._id,
  });

  if (!token) return { friends: [], groups: [] };

  const sw = getSplitwiseClient(token);

  try {
    const [friendsRes, groupsRes, userRes] = await Promise.all([
      sw.friends.getFriends(),
      sw.groups.getGroups(),
      sw.users.getCurrentUser(),
    ]);

    return {
      friends: friendsRes.friends || [],
      groups: groupsRes.groups || [],
      currentUser: userRes.user,
    };
  } catch (error) {
    console.error("Error fetching splitwise data:", error);
    return { friends: [], groups: [], currentUser: null };
  }
}

// User share for itemized splits
export interface UserShare {
  odId: string; // Splitwise user ID
  name: string;
  owedShare: number; // Amount this user owes
  paidShare: number; // Amount this user paid (usually 0 except for the payer)
}

// Item for storing in database
export interface SplitItem {
  name: string;
  amount: number;
  assignedTo: string[]; // User IDs
}

export async function createSplit(params: {
  description: string;
  amount: number;
  date: string;
  groupId?: string;
  details?: string;
  type: "manual" | "auto";
  // For itemized splits
  userShares?: UserShare[];
  items?: SplitItem[];
  tax?: number;
  tip?: number;
  payerId?: string; // Who paid the bill (current user by default)
}) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const token = await convex.query(api.auth.getAccessToken, {
    userId: session.user._id,
  });
  if (!token) throw new Error("No Splitwise token found");

  const sw = getSplitwiseClient(token);

  try {
    // Build the expense params
    const expenseParams: Record<string, any> = {
      cost: params.amount.toFixed(2),
      description: params.description,
      date: params.date,
      group_id: params.groupId ? parseInt(params.groupId) : undefined,
      details: params.details,
    };

    // If we have user shares, use them instead of split_equally
    if (params.userShares && params.userShares.length > 0) {
      // Add each user's share with indexed keys
      params.userShares.forEach((share, index) => {
        expenseParams[`users__${index}__user_id`] = parseInt(share.odId);
        expenseParams[`users__${index}__paid_share`] = share.paidShare.toFixed(2);
        expenseParams[`users__${index}__owed_share`] = share.owedShare.toFixed(2);
      });
    } else {
      // Fall back to equal split
      expenseParams.split_equally = true;
    }

    const res = await sw.expenses.createExpense(expenseParams);

    const expenseId = (res as any)?.expenses?.[0]?.id?.toString();

    // Extract participant IDs from userShares (all Splitwise user IDs involved)
    const participants = params.userShares
      ? params.userShares.map((share) => share.odId)
      : undefined;

    // Save to Convex with detailed breakdown
    await convex.mutation(api.splits.saveSplit, {
      userId: session.user._id,
      amount: params.amount,
      description: params.description,
      date: params.date,
      type: params.type,
      status: "synced",
      groupId: params.groupId,
      splitwiseId: expenseId,
      items: params.items ? JSON.stringify(params.items) : undefined,
      userShares: params.userShares ? JSON.stringify(params.userShares) : undefined,
      tax: params.tax,
      tip: params.tip,
      participants,
    });

    return res;
  } catch (error) {
    console.error("Error creating split:", error);
    throw error;
  }
}
