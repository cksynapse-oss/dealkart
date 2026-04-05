import { Card } from "@/components/ui/card";

export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="space-y-2 mb-6">
        <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  );
}
