"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileCheck, FileText, Shield, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, countKey: null },
  { href: "/admin/listings", label: "Listings", icon: FileCheck, countKey: "pendingListings" as const },
  { href: "/admin/documents", label: "Documents", icon: FileText, countKey: "pendingDocs" as const },
  { href: "/admin/ndas", label: "NDA Requests", icon: Shield, countKey: "pendingNDAs" as const },
  { href: "/admin/users", label: "Users", icon: Users, countKey: null },
];

type PendingCounts = {
  pendingListings: number;
  pendingDocs: number;
  pendingNDAs: number;
};

export function AdminSidebarNav({ counts }: { counts: PendingCounts }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const count = item.countKey ? counts[item.countKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors",
              active
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-2.5">
              <item.icon className={cn("size-4", active ? "text-emerald-600" : "text-slate-400")} />
              {item.label}
            </span>
            {count > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ counts }: { counts: PendingCounts }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const count = item.countKey ? counts[item.countKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs relative",
              active ? "text-emerald-700 font-medium" : "text-slate-500"
            )}
          >
            <span className="relative">
              <item.icon className={cn("size-5", active && "text-emerald-600")} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
