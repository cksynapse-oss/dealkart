import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getNDAStatusColor } from "@/lib/utils";
import { AdminNDAActions } from "@/components/admin/AdminNDAActions";

export const metadata = { title: "NDA Requests — TheBuzSale Admin" };

export default async function AdminNDAsPage() {
  const supabase = await createClient();

  const { data: ndas } = await supabase
    .from("ndas")
    .select("*, profiles!ndas_buyer_id_fkey(full_name, email), listings!ndas_listing_id_fkey(headline)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">NDA requests</h1>
      <p className="text-sm text-slate-500 mb-6">Review and approve buyer NDA submissions</p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Buyer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Listing</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Legal Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Signed</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!ndas || ndas.length === 0) ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">No NDA requests yet.</td>
              </tr>
            ) : ndas.map((n: any) => (
              <tr key={n.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{n.profiles?.full_name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{n.profiles?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600 line-clamp-1">
                  {n.listings?.headline ?? "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                  {n.legal_name}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {n.signed_at ? new Date(n.signed_at).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getNDAStatusColor(n.status)}>{n.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminNDAActions ndaId={n.id} currentStatus={n.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
