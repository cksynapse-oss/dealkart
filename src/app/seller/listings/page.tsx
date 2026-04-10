import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { cn, formatINR, getStatusColor } from "@/lib/utils";
import type { Listing, OnboardingStatus } from "@/types/database";
import { redirect } from "next/navigation";

export default async function SellerListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("onboarding_status, onboarding_layer_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  // Only redirect if seller has never started onboarding
  if (!profile || profile.onboarding_layer_completed === 0) {
    redirect("/seller/onboarding");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const list = (listings ?? []) as Listing[];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          My Listings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All listings tied to your seller account on TheBuzSale
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Listings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No listings yet. Create one from the dashboard.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Headline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Asking price</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="max-w-[240px] truncate font-medium">
                      {l.headline ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          getStatusColor(l.status)
                        )}
                      >
                        {l.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINR(l.asking_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {l.view_count ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
