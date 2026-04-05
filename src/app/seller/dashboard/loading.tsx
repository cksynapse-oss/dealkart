import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SellerDashboardLoading() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
      </div>

      <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-11 w-48 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
