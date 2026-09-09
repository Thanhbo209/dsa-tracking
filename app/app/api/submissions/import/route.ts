import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importSubmission } from "@/lib/submissions/import";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await importSubmission(body);

    return NextResponse.json(result, {
      status: result.created ? 201 : 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid submission data",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith("Problem not found")
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Submission import failed:", error);

    return NextResponse.json(
      { error: "Failed to import submission" },
      { status: 500 },
    );
  }
}
