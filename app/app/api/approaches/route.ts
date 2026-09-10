import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getApproaches } from "@/lib/approaches/service";
import { createApproach } from "@/lib/approaches/service";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate that problemId refers to an actual Problem.id (not a slug).
    // This produces a clear 404 instead of a cryptic P2003 FK violation.
    const problemExists = await prisma.problem.findUnique({
      where: { id: body?.problemId },
      select: { id: true },
    });

    if (!problemExists) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 },
      );
    }

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
