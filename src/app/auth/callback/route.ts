import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDescription = url.searchParams.get("error_description");

  if (oauthError) {
    const msg = oauthDescription ?? oauthError;
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(msg)}`,
        url.origin
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", url.origin)
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(exchangeError.message)}`,
        url.origin
      )
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/login?error=no_session", url.origin)
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const metaRole = user.user_metadata?.role as UserRole | undefined;
  const resolvedRole: UserRole | undefined = profile?.role ?? metaRole;

  let redirectPath: string;
  switch (resolvedRole) {
    case "SELLER":
      redirectPath = "/seller/dashboard";
      break;
    case "BUYER":
      redirectPath = "/buyer/marketplace";
      break;
    case "ADMIN":
      redirectPath = "/admin/dashboard";
      break;
    default:
      redirectPath = "/";
      break;
  }

  return NextResponse.redirect(new URL(redirectPath, url.origin));
}
