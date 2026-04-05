import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
