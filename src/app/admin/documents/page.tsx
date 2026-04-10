import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { AdminDocumentActions } from "@/components/admin/AdminDocumentActions";

async function getDocuments() {
  const supabase = await createAdminClient();
  
  const { data: documents, error } = await supabase
    .from("seller_documents")
    .select(`
      *,
      seller_profiles!inner(
        id,
        business_legal_name,
        user_id
      )
    `)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  const documentsWithUrls = await Promise.all(
    (documents || []).map(async (doc) => {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("seller-documents")
        .createSignedUrl(doc.storage_path, 60 * 60);

      return {
        ...doc,
        signedUrl: signedUrlError ? null : signedUrlData.signedUrl,
        signedUrlError: signedUrlError?.message || null,
      };
    })
  );

  return documentsWithUrls;
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
    default:
      return "secondary";
  }
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-muted-foreground">
            Review and verify seller uploaded documents
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            All Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="size-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
              <p className="text-muted-foreground">
                No documents have been uploaded by sellers yet.
              </p>
            </div>
          ) : (() => {
            const grouped: Record<string, { sellerName: string; docs: typeof documents }> = {};
            for (const doc of documents) {
              const key = doc.seller_profiles?.id ?? "unknown";
              if (!grouped[key]) {
                grouped[key] = {
                  sellerName: doc.seller_profiles?.business_legal_name || "Unknown Seller",
                  docs: [],
                };
              }
              grouped[key].docs.push(doc);
            }
            const groups = Object.values(grouped);

            return (
              <div className="space-y-6">
                {groups.map((group, gi) => {
                  const pendingCount = group.docs.filter(d => (d.verification_status || "PENDING") === "PENDING").length;
                  return (
                    <div key={gi} className="border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{group.sellerName}</p>
                          <p className="text-xs text-slate-500">{group.docs.length} document{group.docs.length !== 1 ? "s" : ""}</p>
                        </div>
                        {pendingCount > 0 && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-white">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">File Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Uploaded</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.docs.map((doc) => (
                            <tr key={doc.id} className="border-b last:border-0">
                              <td className="px-4 py-3">
                                <span className="font-medium text-sm">{doc.document_type.replace(/_/g, " ")}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="max-w-[200px] truncate text-sm" title={doc.original_filename}>
                                  {doc.original_filename}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                {formatFileSize(doc.file_size_bytes)}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                {doc.uploaded_at
                                  ? formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })
                                  : "—"}
                                </td>
                              <td className="px-4 py-3">
                                <Badge variant={statusBadgeVariant(doc.verification_status || "PENDING")}>
                                  {doc.verification_status || "PENDING"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {doc.signedUrl && (
                                    <Link href={doc.signedUrl} target="_blank" rel="noopener noreferrer">
                                      <Button variant="outline" size="sm">
                                        <ExternalLink className="size-4" />
                                        View
                                      </Button>
                                    </Link>
                                  )}
                                  <AdminDocumentActions document={doc} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
