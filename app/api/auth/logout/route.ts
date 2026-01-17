import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    try {
      await convex.mutation(api.auth.deleteSession, { token: sessionToken });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session_token");

  return response;
}
