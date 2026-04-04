import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Users — TheBuzSale Admin" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const roleColor: Record<string, string> = {
    SELLER: "bg-emerald-100 text-emerald-700",
    BUYER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Users</h1>
      <p className="text-sm text-slate-500 mb-6">All registered users on TheBuzSale</p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!users || users.length === 0) ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">No users yet.</td>
              </tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.full_name || "—"}</td>
                <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{u.email || "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={roleColor[u.role] ?? "bg-slate-100 text-slate-600"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
