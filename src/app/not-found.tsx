import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24">
      <Card className="max-w-md border-slate-200 text-center shadow-sm">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <FileX className="size-7" aria-hidden />
          </div>
          <CardTitle className="text-xl">Page not found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/">
            <Button className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Home className="mr-2 size-4" />
              Go back home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
