import { NextResponse } from "next/server";
import {
  analyzeSubmission,
  getSubmissionAnalyses,
} from "@/lib/analysis/service";

interface AnalyzeRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: Request, { params }: AnalyzeRouteProps) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 },
      );
    }

    const analysis = await analyzeSubmission(id);
    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze submission";

    if (message === "Submission not found") {
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
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 },
      );
    }

    const analyses = await getSubmissionAnalyses(id);
    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Failed to fetch submission analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission analyses" },
      { status: 500 },
    );
  }
}
