import Link from "next/link";
import { LayoutDashboard, FileCheck, FileText, Shield, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings", icon: FileCheck },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/ndas", label: "NDA Requests", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-slate-50 p-4">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Admin Console</p>
          <p className="text-sm font-bold text-slate-900 mt-1">TheBuzSale</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around py-2">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 text-xs text-slate-500">
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8">{children}</main>
    </div>
  );
}
