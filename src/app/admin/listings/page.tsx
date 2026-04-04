import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatINRShort, getStatusColor, getIndustryLabel } from "@/lib/utils";
import { AdminListingActions } from "@/components/admin/AdminListingActions";

export const metadata = { title: "Listings Review — TheBuzSale Admin" };

export default async function AdminListingsPage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles!listings_seller_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Listings review</h1>
      <p className="text-sm text-slate-500 mb-6">Approve or reject seller listings</p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Listing</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Seller</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!listings || listings.length === 0) ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">No listings yet.</td>
              </tr>
            ) : listings.map((l: any) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 line-clamp-1">{l.headline || "Untitled"}</p>
                  <p className="text-xs text-slate-500">{l.city}{l.state ? `, ${l.state}` : ""}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-slate-700">{l.profiles?.full_name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{l.profiles?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                  {l.industry ? getIndustryLabel(l.industry) : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-emerald-700">
                  {formatINRShort(l.asking_price)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(l.status)}>{l.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminListingActions listingId={l.id} currentStatus={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
