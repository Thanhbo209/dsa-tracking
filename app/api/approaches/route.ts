import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getApproaches, createApproach } from "@/lib/approaches/service";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate that problemId refers to an actual Problem.id (not a slug).
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

    const approach = await createApproach(user.id, body);

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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const approaches = await getApproaches(user.id, problemId);

  return NextResponse.json(approaches);
}
