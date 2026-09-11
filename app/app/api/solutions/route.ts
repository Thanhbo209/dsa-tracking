import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createSolution, getSolutions } from "@/lib/solutions/service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const approachId = searchParams.get("approachId");

  if (!approachId) {
    return NextResponse.json(
      {
        error: "approachId is required",
      },
      { status: 400 },
    );
  }

  const solutions = await getSolutions(user.id, approachId);

  return NextResponse.json(solutions);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const solution = await createSolution(user.id, body);

    return NextResponse.json(solution, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid solution data",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Solution creation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create solution",
      },
      { status: 500 },
    );
  }
}

