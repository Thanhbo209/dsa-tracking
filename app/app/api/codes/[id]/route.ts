import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { deleteCode, getCode, updateCode } from "@/lib/codes/service";
import { getCurrentUser } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const code = await getCode(user.id, id);

  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  return NextResponse.json(code);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const code = await updateCode(user.id, id, body);

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

    if (error instanceof Error && error.message.includes("unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Code update failed:", error);

    return NextResponse.json(
      { error: "Failed to update code" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await deleteCode(user.id, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Code deletion failed:", error);

    return NextResponse.json(
      { error: "Failed to delete code" },
      { status: 500 },
    );
  }
}

