"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, MessageSquare, Settings, UserCheck } from "lucide-react";

const allNav = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard, soon: false },
  { href: "/seller/onboarding", label: "Onboarding", icon: UserCheck, soon: false, hideWhenActive: true },
  { href: "/seller/listings", label: "My Listings", icon: FileText, soon: false },
  { href: "/seller/messages", label: "Messages", icon: MessageSquare, soon: true },
  { href: "/seller/settings", label: "Settings", icon: Settings, soon: false },
] as const;

export function SellerSidebarNav({ onboardingDone }: { onboardingDone: boolean }) {
  const pathname = usePathname();
  const nav = allNav.filter((item) => !(item.hideWhenActive && onboardingDone));

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-900"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-2">
              <item.icon
                className={cn("size-4 shrink-0", active ? "text-emerald-600" : "text-slate-500")}
                aria-hidden
              />
              {item.label}
            </span>
            {item.soon ? (
              <Badge variant="secondary" className="text-[10px] font-semibold uppercase">
                Soon
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function SellerMobileNav({ onboardingDone }: { onboardingDone: boolean }) {
  const pathname = usePathname();
  const nav = allNav.filter((item) => !(item.hideWhenActive && onboardingDone));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium",
              active ? "text-emerald-700" : "text-slate-600"
            )}
          >
            <span className="relative">
              <item.icon className={cn("size-5", active && "text-emerald-600")} aria-hidden />
              {item.soon ? (
                <span className="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-amber-500" />
              ) : null}
            </span>
            <span className="max-w-full truncate px-0.5 text-center leading-tight">
              {item.label}
            </span>
            {item.soon ? (
              <span className="text-[8px] font-semibold uppercase text-amber-700">Soon</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
