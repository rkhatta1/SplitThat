import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPLITWISE_CLIENT_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth2/callback/splitwise`;

  const authUrl = new URL("https://secure.splitwise.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
