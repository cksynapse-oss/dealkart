"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24">
      <Card className="max-w-md border-slate-200 text-center shadow-sm">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="size-7" aria-hidden />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={reset}
            className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          {process.env.NODE_ENV === "development" && (
            <div className="text-left">
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
