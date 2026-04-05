import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, rejection_reason } = await request.json();

    if (!action || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const updateData: any = {
      verification_status: action,
    };

    if (action === "REJECTED") {
      if (!rejection_reason) {
        return NextResponse.json(
          { error: "Rejection reason is required when rejecting a document" },
          { status: 400 }
        );
      }
      updateData.rejection_reason = rejection_reason;
    }

    const { data, error } = await supabase
      .from("seller_documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating document:", error);
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
