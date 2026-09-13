import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  deleteSolution,
  getSolution,
  updateSolution,
} from "@/lib/solutions/service";
import { getCurrentUser } from "@/lib/auth/session";

interface SolutionRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: SolutionRouteProps) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const solution = await getSolution(user.id, id);

  if (!solution) {
    return NextResponse.json(
      {
        error: "Solution not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(solution);
}

export async function PATCH(request: Request, { params }: SolutionRouteProps) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const solution = await updateSolution(user.id, id, body);

    return NextResponse.json(solution);
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

    console.error("Solution update failed:", error);

    return NextResponse.json(
      {
        error: "Failed to update solution",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: SolutionRouteProps,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await deleteSolution(user.id, id);

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Solution deletion failed:", error);

    return NextResponse.json(
      {
        error: "Failed to delete solution",
      },
      { status: 500 },
    );
  }
}

