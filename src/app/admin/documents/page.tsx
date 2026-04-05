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
        business_name,
        user_id,
        profiles!inner(
          full_name,
          email
        )
      )
    `)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  // Generate signed URLs for each document
  const documentsWithUrls = await Promise.all(
    (documents || []).map(async (doc) => {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("seller-documents")
        .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour expiry

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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Seller
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Document Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Uploaded
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {doc.seller_profiles?.business_name || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {doc.seller_profiles?.profiles?.full_name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {doc.seller_profiles?.profiles?.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{doc.document_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] truncate" title={doc.original_filename}>
                          {doc.original_filename}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatFileSize(doc.file_size_bytes)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {doc.uploaded_at
                          ? formatDistanceToNow(new Date(doc.uploaded_at), {
                              addSuffix: true,
                            })
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
                            <Link
                              href={doc.signedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                              >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
