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

export async function createSplit(params: {
  description: string;
  amount: number;
  date: string;
  groupId?: string;
  details?: string;
  type: "manual" | "auto";
}) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const token = await convex.query(api.auth.getAccessToken, {
    userId: session.user._id,
  });
  if (!token) throw new Error("No Splitwise token found");

  const sw = getSplitwiseClient(token);

  try {
    const res = await sw.expenses.createExpense({
      cost: params.amount.toString(),
      description: params.description,
      date: params.date,
      group_id: params.groupId ? parseInt(params.groupId) : undefined,
      details: params.details,
      split_equally: true,
    });

    const expenseId = (res as any)?.expenses?.[0]?.id?.toString();

    // Save to Convex
    await convex.mutation(api.splits.saveSplit, {
      userId: session.user._id,
      amount: params.amount,
      description: params.description,
      date: params.date,
      type: params.type,
      status: "synced",
      groupId: params.groupId,
      splitwiseId: expenseId,
    });

    return res;
  } catch (error) {
    console.error("Error creating split:", error);
    throw error;
  }
}
