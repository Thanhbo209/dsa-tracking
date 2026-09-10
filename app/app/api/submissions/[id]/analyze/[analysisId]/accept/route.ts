import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { promoteDraftToKnowledge } from "@/lib/analysis/promotion";

interface AcceptRouteProps {
  params: Promise<{
    id: string;
    analysisId: string;
  }>;
}

export async function POST(request: Request, { params }: AcceptRouteProps) {
  try {
    const { id, analysisId } = await params;

    if (!id || !analysisId) {
      return NextResponse.json(
        { error: "Submission ID and Analysis ID are required" },
        { status: 400 },
      );
    }

    let editedDraft: unknown = undefined;
    try {
      const body = await request.json();
      if (body && typeof body === "object" && "editedDraft" in body) {
        editedDraft = body.editedDraft;
      }
    } catch {
      // Empty body is valid when accepting without edits
    }

    const result = await promoteDraftToKnowledge(id, analysisId, editedDraft);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid draft content", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to accept draft";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (
      message.includes("Cannot accept analysis") ||
      message.includes("belong to this submission") ||
      message.includes("no longer in DRAFT_READY")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Draft acceptance failed:", error);
    return NextResponse.json(
      { error: "Failed to promote draft to knowledge" },
      { status: 500 },
    );
  }
}
