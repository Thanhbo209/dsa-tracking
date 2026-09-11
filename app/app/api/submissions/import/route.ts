import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importSubmission } from "@/lib/submissions/import";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED_ORIGIN = "https://leetcode.com";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentication required to import submissions. Please log in to DSA Tracking.",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Credentials": "true",
          },
        },
      );
    }

    const body = await request.json();
    const result = await importSubmission(user.id, body);

    return NextResponse.json(result, {
      status: result.created ? 201 : 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Credentials": "true",
      },
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
