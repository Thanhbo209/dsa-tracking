import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getApproaches } from "@/lib/approaches/service";
import { createApproach } from "@/lib/approaches/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const approach = await createApproach(body);

    return NextResponse.json(approach, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid approach data",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Approach creation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create approach",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    return NextResponse.json(
      {
        error: "problemId is required",
      },
      { status: 400 },
    );
  }

  const approaches = await getApproaches(problemId);

  return NextResponse.json(approaches);
}
