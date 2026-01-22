import { NextResponse } from "next/server";
import { generateOAuthState } from "@/lib/crypto";

export async function GET() {
  const clientId = process.env.SPLITWISE_CLIENT_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth2/callback/splitwise`;

  // Generate a cryptographically secure state parameter for CSRF protection
  const state = generateOAuthState();

  const authUrl = new URL("https://secure.splitwise.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());

  // Store state in a secure, httpOnly cookie for validation on callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes - state should be short-lived
    path: "/",
  });

  return response;
}
