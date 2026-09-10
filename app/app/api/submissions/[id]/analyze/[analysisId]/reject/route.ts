import { NextResponse } from "next/server";
import { rejectDraft } from "@/lib/analysis/promotion";

interface RejectRouteProps {
  params: Promise<{
    id: string;
    analysisId: string;
  }>;
}

export async function POST(_request: Request, { params }: RejectRouteProps) {
  try {
    const { id, analysisId } = await params;

    if (!id || !analysisId) {
      return NextResponse.json(
        { error: "Submission ID and Analysis ID are required" },
        { status: 400 },
      );
    }

    const updatedAnalysis = await rejectDraft(id, analysisId);
    return NextResponse.json(updatedAnalysis, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject draft";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (
      message.includes("Cannot reject analysis") ||
      message.includes("belong to this submission") ||
      message.includes("no longer in DRAFT_READY")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Draft rejection failed:", error);
    return NextResponse.json(
      { error: "Failed to reject draft" },
      { status: 500 },
    );
  }
}
