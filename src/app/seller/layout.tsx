import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, MessageSquare, Settings, UserCheck } from "lucide-react";

const nav = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard, soon: false },
  { href: "/seller/onboarding", label: "Onboarding", icon: UserCheck, soon: false },
  { href: "/seller/listings", label: "My Listings", icon: FileText, soon: false },
  { href: "/seller/messages", label: "Messages", icon: MessageSquare, soon: true },
  { href: "/seller/settings", label: "Settings", icon: Settings, soon: true },
] as const;

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessName = "Your business";
  if (user) {
    const { data: sp } = await supabase
      .from("seller_profiles")
      .select("business_legal_name, dba_name")
      .eq("user_id", user.id)
      .maybeSingle();
    businessName =
      sp?.dba_name?.trim() ||
      sp?.business_legal_name?.trim() ||
      "Your business";
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col bg-slate-50 md:flex-row">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-100 px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seller account
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            {businessName}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors",
                "hover:bg-emerald-50 hover:text-emerald-900"
              )}
            >
              <span className="flex items-center gap-2">
                <item.icon className="size-4 shrink-0 text-slate-500" aria-hidden />
                {item.label}
              </span>
              {item.soon ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold uppercase"
                >
                  Coming soon
                </Badge>
              ) : null}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-slate-600"
          >
            <span className="relative">
              <item.icon className="size-5" aria-hidden />
              {item.soon ? (
                <span className="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-amber-500" />
              ) : null}
            </span>
            <span className="max-w-full truncate px-0.5 text-center leading-tight">
              {item.label}
            </span>
            {item.soon ? (
              <span className="text-[8px] font-semibold uppercase text-amber-700">
                Soon
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
