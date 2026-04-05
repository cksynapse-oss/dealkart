import { Card, CardContent } from "@/components/ui/card";

export default function SellerOnboardingLoading() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="h-10 w-96 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-5 w-[512px] bg-slate-100 rounded animate-pulse" />
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white px-4 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                      <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                      <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-11 w-24 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-11 w-48 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
