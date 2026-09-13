import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createCode, getCodes } from "@/lib/codes/service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const solutionId = searchParams.get("solutionId");

  if (!solutionId) {
    return NextResponse.json(
      { error: "solutionId is required" },
      { status: 400 },
    );
  }

  const codes = await getCodes(user.id, solutionId);

  return NextResponse.json(codes);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const code = await createCode(user.id, body);

    return NextResponse.json(code, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid code data",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Code creation failed:", error);

    return NextResponse.json(
      { error: "Failed to create code" },
      { status: 500 },
    );
  }
}

