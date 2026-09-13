import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  updateApproach,
  getApproach,
  deleteApproach,
} from "@/lib/approaches/service";
import { getCurrentUser } from "@/lib/auth/session";

interface ApproachRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: ApproachRouteProps) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const approach = await getApproach(user.id, id);

  if (!approach) {
    return NextResponse.json(
      {
        error: "Approach not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(approach);
}

export async function PATCH(request: Request, { params }: ApproachRouteProps) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const approach = await updateApproach(user.id, id, body);

    return NextResponse.json(approach);
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

    console.error("Approach update failed:", error);

    return NextResponse.json(
      {
        error: "Failed to update approach",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: ApproachRouteProps,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await deleteApproach(user.id, id);

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Approach deletion failed:", error);

    return NextResponse.json(
      {
        error: "Failed to delete approach",
      },
      { status: 500 },
    );
  }
}

