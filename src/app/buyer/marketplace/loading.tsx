import { Card, CardContent } from "@/components/ui/card";

export default function BuyerMarketplaceLoading() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-11 w-64 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-11 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-slate-200 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-6 w-full bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
