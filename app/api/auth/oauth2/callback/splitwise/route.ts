import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { encryptToken } from "@/lib/crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Validate state parameter for CSRF protection
  const storedState = request.cookies.get("oauth_state")?.value;

  if (!storedState || !state || storedState !== state) {
    console.error("OAuth state mismatch - possible CSRF attack");
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`
    );
  }

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://secure.splitwise.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.SPLITWISE_CLIENT_KEY!,
          client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth2/callback/splitwise`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Get user info from Splitwise
    const userResponse = await fetch(
      "https://secure.splitwise.com/api/v3.0/get_current_user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=user_fetch_failed`
      );
    }

    const userData = await userResponse.json();
    const user = userData.user;

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : undefined;

    // Create or update user in Convex with encrypted tokens
    const userId = await convex.mutation(api.auth.upsertUser, {
      email: user.email,
      name: `${user.first_name} ${user.last_name || ""}`.trim(),
      image: user.picture?.medium,
      splitwiseId: user.id.toString(),
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    });

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    // Create session in Convex
    await convex.mutation(api.auth.createSession, {
      userId,
      token: sessionToken,
      expiresAt,
    });

    // Set session cookie and redirect
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app`
    );

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt),
      path: "/",
    });

    // Clear the oauth_state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=callback_failed`
    );
  }
}
