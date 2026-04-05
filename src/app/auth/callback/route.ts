import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

function pathForRole(role: UserRole | undefined | null): string {
  switch (role) {
    case "SELLER":
      return "/seller/dashboard";
    case "BUYER":
      return "/buyer/marketplace";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

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

  const supabase = await createClient();

  if (!code) {
    const {
      data: { user: existingUser },
    } = await supabase.auth.getUser();
    if (existingUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", existingUser.id)
        .maybeSingle();
      const metaRole = existingUser.user_metadata?.role as UserRole | undefined;
      const resolvedRole: UserRole | undefined = profile?.role ?? metaRole;
      return NextResponse.redirect(
        new URL(pathForRole(resolvedRole), url.origin)
      );
    }
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", url.origin)
    );
  }

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

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: user.user_metadata?.role ?? "BUYER",
      full_name: user.user_metadata?.full_name ?? user.email ?? "User",
      email: user.email,
    },
    { onConflict: "id" }
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const metaRole = user.user_metadata?.role as UserRole | undefined;
  const resolvedRole: UserRole | undefined = profile?.role ?? metaRole;

  return NextResponse.redirect(
    new URL(pathForRole(resolvedRole), url.origin)
  );
}
