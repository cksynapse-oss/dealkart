import { createClient } from "@/lib/supabase/server";
import { AdminSidebarNav, AdminMobileNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const [
    { count: pendingListings },
    { count: pendingDocs },
    { count: pendingNDAs },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "PENDING_REVIEW"),
    supabase.from("seller_documents").select("*", { count: "exact", head: true }).eq("verification_status", "PENDING"),
    supabase.from("ndas").select("*", { count: "exact", head: true }).eq("status", "SUBMITTED"),
  ]);

  const counts = {
    pendingListings: pendingListings ?? 0,
    pendingDocs: pendingDocs ?? 0,
    pendingNDAs: pendingNDAs ?? 0,
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      <aside className="hidden md:flex w-56 flex-col border-r bg-slate-50 p-4">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Admin Console</p>
          <p className="text-sm font-bold text-slate-900 mt-1">TheBuzSale</p>
        </div>
        <AdminSidebarNav counts={counts} />
      </aside>

      <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8">{children}</main>

      <AdminMobileNav counts={counts} />
    </div>
  );
}
