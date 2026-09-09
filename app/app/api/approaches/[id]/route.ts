import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  updateApproach,
  getApproach,
  deleteApproach,
} from "@/lib/approaches/service";

interface ApproachRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: ApproachRouteProps) {
  const { id } = await params;

  const approach = await getApproach(id);

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
    const { id } = await params;
    const body = await request.json();

    const approach = await updateApproach(id, body);

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
    const { id } = await params;

    await deleteApproach(id);

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
