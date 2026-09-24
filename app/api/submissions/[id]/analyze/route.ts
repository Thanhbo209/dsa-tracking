import { NextResponse } from "next/server";
import {
  analyzeSubmission,
  getSubmissionAnalyses,
} from "@/lib/analysis/service";
import { getCurrentUser } from "@/lib/auth/session";
import {
  AVAILABLE_ANALYSIS_MODELS,
  isValidAnalysisModel,
} from "@/lib/analysis/models";

interface AnalyzeRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: AnalyzeRouteProps) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 },
      );
    }

    let modelName: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.modelName === "string" && body.modelName.trim() !== "") {
        const trimmed = body.modelName.trim();
        if (!isValidAnalysisModel(trimmed)) {
          return NextResponse.json(
            {
              error: `Invalid model '${trimmed}'. Available models: ${AVAILABLE_ANALYSIS_MODELS.map((m) => m.id).join(", ")}`,
            },
            { status: 400 },
          );
        }
        modelName = trimmed;
      }
    } catch {
      // Body may be empty on plain POST requests; continue with default active model
    }

    const analysis = modelName
      ? await analyzeSubmission(user.id, id, {
          modelName,
          disableAutoFallback: true,
        })
      : await analyzeSubmission(user.id, id);

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze submission";

    if (message.includes("not found") || message.includes("unauthorized")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("Submission analysis request failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze submission" },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, { params }: AnalyzeRouteProps) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 },
      );
    }

    const analyses = await getSubmissionAnalyses(user.id, id);
    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Failed to fetch submission analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission analyses" },
      { status: 500 },
    );
  }
}

