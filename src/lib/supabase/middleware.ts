import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes — no auth required
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/callback",
    "/buyer/marketplace",
  ];
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/buyer/listing")
  ) {
    return supabaseResponse;
  }

  // API routes — handle auth in the route handler
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Fetch user role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // Route protection by role
  if (pathname.startsWith("/seller") && role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/buyer") && role !== "BUYER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return supabaseResponse;
}
