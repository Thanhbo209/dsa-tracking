import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importSubmission } from "@/lib/submissions/import";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const isAllowed =
    origin === "https://leetcode.com" ||
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://leetcode.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    let user = await getCurrentUser();

    // Fallback: check Authorization: Bearer <session_token> if cookie wasn't picked up
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
        {
          error:
            "Authentication required to import submissions. Please log in to DSA Tracking.",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const body = await request.json();
    const result = await importSubmission(user.id, body);

    return NextResponse.json(result, {
      status: result.created ? 201 : 200,
      headers: corsHeaders,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid submission data",
          issues: error.issues,
        },
        { status: 400, headers: corsHeaders },
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith("Problem not found")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 404, headers: corsHeaders },
      );
    }

    console.error("Submission import failed:", error);

    return NextResponse.json(
      { error: "Failed to import submission" },
      { status: 500, headers: corsHeaders },
    );
  }
}

