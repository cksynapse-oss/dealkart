"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User } from "lucide-react";

const roleLabels: Record<UserRole, string> = {
  SELLER: "Seller",
  BUYER: "Buyer",
  ADMIN: "Admin",
};

function roleBadgeClass(role: UserRole): string {
  if (role === "ADMIN") return "bg-amber-100 text-amber-900";
  if (role === "SELLER") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-800";
}

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userBar, setUserBar] = useState<{
    fullName: string;
    role: UserRole;
  } | null>(null);

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUserBar(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const metaName = user.user_metadata?.full_name;
    const metaRole = user.user_metadata?.role as UserRole | undefined;
    const fullName =
      profile?.full_name ??
      (typeof metaName === "string" ? metaName : null) ??
      user.email ??
      "Account";
    const role = profile?.role ?? metaRole ?? "BUYER";
    setUserBar({ fullName, role });
  }, [supabase]);

  useEffect(() => {
    void loadProfile();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });
    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const handleLogout = async () => {
    setMobileOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      return;
    }
    setUserBar(null);
    router.refresh();
    router.push("/");
  };

  const AuthLinks = ({ layout }: { layout: "row" | "column" }) => (
    <div
      className={cn(
        "flex gap-2",
        layout === "column" ? "flex-col" : "flex-row items-center"
      )}
    >
      <Link
        href="/auth/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          layout === "column" && "w-full justify-center"
        )}
      >
        Login
      </Link>
      <Link
        href="/auth/register"
        className={cn(
          buttonVariants({
            variant: "default",
            size: "sm",
            className: "bg-emerald-600 text-white hover:bg-emerald-700",
          }),
          layout === "column" && "w-full justify-center"
        )}
      >
        Register
      </Link>
    </div>
  );

  const AccountDropdown = () => {
    if (!userBar) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5"
          )}
        >
          <User className="size-4 shrink-0" aria-hidden />
          <span className="max-w-[120px] truncate">Account</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
            <LogOut className="size-4" aria-hidden />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-emerald-600"
        >
          TheBuzSale
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {userBar ? (
            <>
              <span className="max-w-[160px] truncate text-sm font-medium text-slate-800">
                {userBar.fullName}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  roleBadgeClass(userBar.role)
                )}
              >
                {roleLabels[userBar.role]}
              </span>
              <AccountDropdown />
            </>
          ) : (
            <AuthLinks layout="row" />
          )}
        </div>

        <div className="flex items-center md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {userBar ? (
              <>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                  <span className="truncate text-sm font-medium text-slate-900">
                    {userBar.fullName}
                  </span>
                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
                      roleBadgeClass(userBar.role)
                    )}
                  >
                    {roleLabels[userBar.role]}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="size-4" aria-hidden />
                  Log out
                </Button>
              </>
            ) : (
              <AuthLinks layout="column" />
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
