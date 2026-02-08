"use server";

import { getSplitwiseClient } from "@/lib/splitwise";
import { decryptToken } from "@/lib/crypto";
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

/**
 * Gets the decrypted access token for the current user
 */
async function getDecryptedAccessToken(userId: string): Promise<string | null> {
  const encryptedToken = await convex.query(api.auth.getAccessToken, {
    userId: userId as any,
  });

  console.log("Encrypted token retrieved:", encryptedToken ? `${encryptedToken.substring(0, 20)}...` : "null");

  if (!encryptedToken) {
    console.error("No encrypted token found in database for user:", userId);
    return null;
  }

  try {
    const decrypted = decryptToken(encryptedToken);
    console.log("Token decrypted successfully, length:", decrypted.length);
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt access token. This usually means TOKEN_ENCRYPTION_KEY is different from when the token was encrypted:", error);
    return null;
  }
}

export async function getSplitwiseData() {
  const session = await getSession();
  if (!session) return null;

  const token = await getDecryptedAccessToken(session.user._id);

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
  currency?: string;
  userNotes?: string; // User's custom notes
  details?: string; // Auto-generated breakdown
  groupId?: string;
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

  const token = await getDecryptedAccessToken(session.user._id);
  if (!token) {
    throw new Error("No Splitwise token found. Please log out and log in again to refresh your authentication.");
  }

  const sw = getSplitwiseClient(token);

  try {
    // Combine user notes with auto-generated details
    let combinedNotes = "";
    if (params.userNotes) {
      combinedNotes = params.userNotes + "\n\n---\n\n";
    }
    if (params.details) {
      combinedNotes += params.details;
    }

    // Build the expense params
    const expenseParams: Record<string, any> = {
      cost: params.amount.toFixed(2),
      description: params.description,
      date: params.date,
      currency_code: params.currency || "USD",
      group_id: params.groupId ? parseInt(params.groupId) : undefined,
      details: combinedNotes || undefined,
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

    console.log("Creating Splitwise expense with params:", JSON.stringify(expenseParams, null, 2));

    const res = await sw.expenses.createExpense(expenseParams);

    // Log the full response for debugging
    console.log("Splitwise createExpense response:", JSON.stringify(res, null, 2));

    // Validate the response - Splitwise returns { expenses: [...] } on success
    // or { errors: {...} } on failure
    if ((res as any)?.errors) {
      console.error("Splitwise API error:", (res as any).errors);
      throw new Error(`Splitwise API error: ${JSON.stringify((res as any).errors)}`);
    }

    const expenseId = (res as any)?.expenses?.[0]?.id?.toString();

    if (!expenseId) {
      console.error("No expense ID returned from Splitwise. Full response:", res);
      throw new Error("Failed to create expense on Splitwise - no expense ID returned");
    }

    console.log("Successfully created Splitwise expense:", expenseId);

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
      currency: params.currency || "USD",
      notes: combinedNotes || undefined,
      userNotes: params.userNotes,
      type: params.type,
      status: "synced",
      groupId: params.groupId,
      splitwiseId: expenseId,
      items: params.items ? JSON.stringify(params.items) : undefined,
      userShares: params.userShares ? JSON.stringify(params.userShares) : undefined,
      tax: params.tax,
      tip: params.tip,
      payerId: params.payerId,
      participants,
    });

    return res;
  } catch (error) {
    console.error("Error creating split:", error);
    throw error;
  }
}

export async function updateSplit(params: {
  splitId: string; // Convex ID
  splitwiseId: string; // Splitwise expense ID
  description?: string;
  amount?: number;
  date?: string;
  currency?: string;
  userNotes?: string; // User's custom notes
  details?: string; // Auto-generated breakdown
  groupId?: string;
  // For itemized splits
  userShares?: UserShare[];
  items?: SplitItem[];
  tax?: number;
  tip?: number;
  payerId?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const token = await getDecryptedAccessToken(session.user._id);
  if (!token) throw new Error("No Splitwise token found");

  try {
    const expenseId = params.splitwiseId.toString();
    console.log("Updating Splitwise expense ID:", expenseId);

    // Combine user notes with auto-generated details
    let combinedNotes = "";
    if (params.userNotes) {
      combinedNotes = params.userNotes + "\n\n---\n\n";
    }
    if (params.details) {
      combinedNotes += params.details;
    }

    // Build the request body as URLSearchParams (Splitwise expects form-encoded data)
    const formData = new URLSearchParams();

    if (params.description) formData.append("description", params.description);
    if (params.amount) formData.append("cost", params.amount.toFixed(2));
    if (params.date) formData.append("date", params.date);
    if (params.currency) formData.append("currency_code", params.currency);
    if (params.groupId) formData.append("group_id", params.groupId);
    if (combinedNotes) formData.append("details", combinedNotes);

    // If we have user shares, add them
    if (params.userShares && params.userShares.length > 0) {
      params.userShares.forEach((share, index) => {
        formData.append(`users__${index}__user_id`, share.odId);
        formData.append(`users__${index}__paid_share`, share.paidShare.toFixed(2));
        formData.append(`users__${index}__owed_share`, share.owedShare.toFixed(2));
      });
    }

    // Make direct REST API call to Splitwise
    const response = await fetch(
      `https://secure.splitwise.com/api/v3.0/update_expense/${expenseId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Splitwise update failed:", response.status, errorText);
      throw new Error(`Splitwise API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Splitwise update successful:", result);

    // Extract participant IDs from userShares
    const participants = params.userShares
      ? params.userShares.map((share) => share.odId)
      : undefined;

    // Update in Convex
    await convex.mutation(api.splits.updateSplit, {
      id: params.splitId as any,
      amount: params.amount,
      description: params.description,
      currency: params.currency,
      notes: combinedNotes || undefined,
      userNotes: params.userNotes,
      items: params.items ? JSON.stringify(params.items) : undefined,
      userShares: params.userShares ? JSON.stringify(params.userShares) : undefined,
      tax: params.tax,
      tip: params.tip,
      payerId: params.payerId,
      participants,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating split:", error);
    throw error;
  }
}
