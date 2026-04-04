import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default function SellerMessagesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
      <Card className="max-w-md border-slate-200 text-center shadow-sm">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <MessageSquare className="size-7" aria-hidden />
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <CardTitle className="text-xl">Messages</CardTitle>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <CardDescription>
            Buyer conversations and deal rooms will appear here in a future
            TheBuzSale release.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
