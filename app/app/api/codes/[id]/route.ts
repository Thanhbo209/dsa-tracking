import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { deleteCode, getCode, updateCode } from "@/lib/codes/service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const code = await getCode(id);

  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  return NextResponse.json(code);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const body = await request.json();

    const code = await updateCode(id, body);

    return NextResponse.json(code);
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

    console.error("Code update failed:", error);

    return NextResponse.json(
      { error: "Failed to update code" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    await deleteCode(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Code deletion failed:", error);

    return NextResponse.json(
      { error: "Failed to delete code" },
      { status: 500 },
    );
  }
}
