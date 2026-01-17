import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const result = await convex.query(api.auth.getSessionByToken, {
      token: sessionToken,
    });

    if (!result) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: result.user._id,
        email: result.user.email,
        name: result.user.name,
        image: result.user.image,
      },
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
