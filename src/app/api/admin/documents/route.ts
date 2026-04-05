import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
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

    return NextResponse.json({ documents: documentsWithUrls });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
