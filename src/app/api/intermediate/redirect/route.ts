import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/error?message=No authorization code received", req.url),
    );
  }
  if (!state) {
    return NextResponse.redirect(
      new URL("/auth/error?message=No state parameter received", req.url),
    );
  }
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?message=${encodeURIComponent(error)}`, req.url),
    );
  }

    // Redirect to the next step in your authentication flow
    const aurinkoUrl = new URL('https://api.aurinko.io/v1/auth/callback')
    aurinkoUrl.searchParams.set('code', code);
    aurinkoUrl.searchParams.set('state', state);

    return NextResponse.redirect(aurinkoUrl.toString())
};
