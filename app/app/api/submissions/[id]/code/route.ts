import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { linkSubmissionToCode } from "@/lib/submissions/link-code";
import { linkSubmissionCodeSchema } from "@/lib/validation/submission-code";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const body = await request.json();
    const data = linkSubmissionCodeSchema.parse(body);

    const submission = await linkSubmissionToCode(id, data.codeId);

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid submission code data",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "Code not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message === "Submission not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error instanceof Error &&
      error.message === "Code does not belong to the submission's problem"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Submission code linking failed:", error);

    return NextResponse.json(
      { error: "Failed to link submission to code" },
      { status: 500 },
    );
  }
}
