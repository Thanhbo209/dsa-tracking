import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createCode, getCodes } from "@/lib/codes/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const solutionId = searchParams.get("solutionId");

  if (!solutionId) {
    return NextResponse.json(
      { error: "solutionId is required" },
      { status: 400 },
    );
  }

  const codes = await getCodes(solutionId);

  return NextResponse.json(codes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = await createCode(body);

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

    console.error("Code creation failed:", error);

    return NextResponse.json(
      { error: "Failed to create code" },
      { status: 500 },
    );
  }
}
