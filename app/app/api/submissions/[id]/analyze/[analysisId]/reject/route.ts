import { NextResponse } from "next/server";
import { rejectDraft } from "@/lib/analysis/promotion";
import { getCurrentUser } from "@/lib/auth/session";

interface RejectRouteProps {
  params: Promise<{
    id: string;
    analysisId: string;
  }>;
}

export async function POST(_request: Request, { params }: RejectRouteProps) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, analysisId } = await params;

    if (!id || !analysisId) {
      return NextResponse.json(
        { error: "Submission ID and Analysis ID are required" },
        { status: 400 },
      );
    }

    const updatedAnalysis = await rejectDraft(user.id, id, analysisId);
    return NextResponse.json(updatedAnalysis, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject draft";

    if (message.includes("not found") || message.includes("unauthorized")) {
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
