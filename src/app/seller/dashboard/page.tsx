import { DashboardCreateListingButton } from "@/components/seller/DashboardCreateListingButton";
import { OnboardingContinueBanner } from "@/components/seller/OnboardingContinueBanner";
import { Badge } from "@/components/ui/badge";
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

function profileStatusLabel(status: OnboardingStatus): string {
  const map: Record<OnboardingStatus, string> = {
    NOT_STARTED: "Not started",
    IN_PROGRESS: "In progress",
    PENDING_DOCUMENTS: "Pending documents",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
  };
  return map[status] ?? status;
}

function profileStatusBadgeClass(status: OnboardingStatus): string {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "PENDING_DOCUMENTS") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const list = (listings ?? []) as Listing[];
  const listingIds = list.map((l) => l.id);

  let ndaCount = 0;
  if (listingIds.length > 0) {
    const { count } = await supabase
      .from("ndas")
      .select("id", { count: "exact", head: true })
      .in("listing_id", listingIds);
    ndaCount = count ?? 0;
  }

  const totalViews = list.reduce((acc, l) => acc + (l.view_count ?? 0), 0);
  const onboardingDone =
    profile != null && profile.onboarding_layer_completed >= 4;
  const progressPct = profile
    ? Math.min(100, Math.round((profile.onboarding_layer_completed / 4) * 100))
    : 0;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your TheBuzSale seller account
        </p>
      </div>

      {!onboardingDone && profile ? (
        <OnboardingContinueBanner
          progressPercent={progressPct}
          layerCompleted={profile.onboarding_layer_completed}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{list.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{totalViews}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active NDAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{ndaCount}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <Badge
                variant="outline"
                className={cn(
                  "font-semibold",
                  profileStatusBadgeClass(profile.onboarding_status)
                )}
              >
                {profileStatusLabel(profile.onboarding_status)}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Your listings</h2>
        <DashboardCreateListingButton
          label={
            list.length === 0
              ? "Create Your First Listing"
              : "Create listing"
          }
        />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <p className="font-medium text-slate-800">No listings yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Create a draft listing from your profile and financials. Our
                team will review it before it goes live.
              </p>
            </div>
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
                    <TableCell className="max-w-[220px] truncate font-medium">
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
                    <TableCell className="text-right text-muted-foreground text-xs">
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
