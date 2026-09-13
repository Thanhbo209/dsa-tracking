import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const updateCodeSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  runtimeMs: z.number().nullable().optional(),
  memoryBytes: z.number().nullable().optional(),
  language: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    let user = await getCurrentUser();

    // Support Bearer token authentication from extension or same-origin
    if (!user) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token) {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
          });

          if (dbSession && dbSession.expiresAt > new Date()) {
            user = {
              id: dbSession.user.id,
              name: dbSession.user.name,
              email: dbSession.user.email,
              username: dbSession.user.username,
              displayUsername: dbSession.user.displayUsername,
              bio: dbSession.user.bio,
              image: dbSession.user.image,
              createdAt: dbSession.user.createdAt,
            };
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to update submission code." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!submission || submission.userId !== user.id) {
      return NextResponse.json(
        { error: "Submission not found or unauthorized." },
        { status: 404 },
      );
    }

    const json = await request.json();
    const data = updateCodeSchema.parse(json);

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        code: data.code,
        runtimeMs: data.runtimeMs ?? undefined,
        memoryBytes: data.memoryBytes != null ? BigInt(data.memoryBytes) : undefined,
        language: data.language ?? undefined,
      },
      select: {
        id: true,
        code: true,
        language: true,
        runtimeMs: true,
        memoryBytes: true,
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        ...updated,
        memoryBytes: updated.memoryBytes ? Number(updated.memoryBytes) : null,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid submission code payload", issues: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update submission code:", error);
    return NextResponse.json(
      { error: "Failed to persist submission code." },
      { status: 500 },
    );
  }
}
