import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getNDAStatusColor } from "@/lib/utils";
import { AdminNDAActions } from "@/components/admin/AdminNDAActions";
import { Phone } from "lucide-react";

export const metadata = { title: "NDA Requests — TheBuzSale Admin" };

export default async function AdminNDAsPage() {
  const supabase = await createClient();

  const { data: ndas } = await supabase
    .from("ndas")
    .select("*, profiles!ndas_buyer_id_fkey(full_name, email), listings!ndas_listing_id_fkey(headline, seller_id)")
    .order("created_at", { ascending: false });

  // Fetch seller contact info for each NDA's listing
  const sellerIds = [...new Set((ndas ?? []).map((n: any) => n.listings?.seller_id).filter(Boolean))];
  let sellerMap: Record<string, { full_name: string; mobile: string | null; email: string | null }> = {};
  if (sellerIds.length > 0) {
    const { data: sellerProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, mobile, email")
      .in("id", sellerIds);
    if (sellerProfiles) {
      sellerMap = Object.fromEntries(sellerProfiles.map((p) => [p.id, p]));
    }
  }

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
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Seller Contact</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Legal Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Signed</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!ndas || ndas.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">No NDA requests yet.</td>
              </tr>
            ) : ndas.map((n: any) => {
              const seller = n.listings?.seller_id ? sellerMap[n.listings.seller_id] : null;
              return (
              <tr key={n.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{n.profiles?.full_name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{n.profiles?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600 line-clamp-1">
                  {n.listings?.headline ?? "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {seller ? (
                    <div>
                      <p className="text-slate-700 text-sm">{seller.full_name}</p>
                      {seller.mobile && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" /> {seller.mobile}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
