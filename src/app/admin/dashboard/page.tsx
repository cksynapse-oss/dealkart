import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Users, Store, ShoppingBag, FileText, Shield, Clock } from "lucide-react";

export const metadata = { title: "Admin Dashboard — TheBuzSale" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: sellers },
    { count: buyers },
    { count: liveListings },
    { count: pendingListings },
    { count: pendingNDAs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "SELLER"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "BUYER"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "LIVE"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "PENDING_REVIEW"),
    supabase.from("ndas").select("*", { count: "exact", head: true }).eq("status", "SUBMITTED"),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Sellers", value: sellers ?? 0, icon: Store, color: "text-emerald-600 bg-emerald-50" },
    { label: "Buyers", value: buyers ?? 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
    { label: "Live Listings", value: liveListings ?? 0, icon: FileText, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Review", value: pendingListings ?? 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Pending NDAs", value: pendingNDAs ?? 0, icon: Shield, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">TheBuzSale admin overview</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`size-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="size-4" />
              </div>
              <span className="text-sm text-slate-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
