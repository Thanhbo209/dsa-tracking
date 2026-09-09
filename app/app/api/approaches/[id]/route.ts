import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateApproach } from "@/lib/approaches/service";

interface ApproachRouteProps {
  params: Promise<{
    id: string;
  }>;
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
