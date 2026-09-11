import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { syncProblem } from "@/lib/leetcode/sync";
import type { Difficulty, SubmissionStatus } from "@/lib/generated/prisma/client";

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

const syncPayloadSchema = z.object({
  leetcodeUsername: z.string().optional(),
  calendar: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        count: z.number().int().nonnegative(),
      }),
    )
    .default([]),
  solvedProblems: z
    .array(
      z.object({
        slug: z.string(),
        difficulty: z.string(),
        title: z.string().optional(),
        leetcodeId: z.number().nullable().optional(),
      }),
    )
    .default([]),
  submissions: z
    .array(
      z.object({
        externalId: z.string(),
        problemSlug: z.string(),
        timestamp: z.number(),
        status: z.string(),
        language: z.string().optional(),
        runtimeMs: z.number().nullable().optional(),
        memoryBytes: z.number().nullable().optional(),
      }),
    )
    .default([]),
});

function normalizeDifficulty(diff: string): Difficulty {
  const upper = diff.toUpperCase();
  if (upper === "EASY") return "EASY";
  if (upper === "HARD") return "HARD";
  return "MEDIUM";
}

function mapSubmissionStatus(raw: string): SubmissionStatus {
  const s = raw.toUpperCase().replace(/\s+/g, "_");
  if (s.includes("ACCEPT")) return "ACCEPTED";
  if (s.includes("WRONG")) return "WRONG_ANSWER";
  if (s.includes("TIME")) return "TIME_LIMIT_EXCEEDED";
  if (s.includes("MEMORY")) return "MEMORY_LIMIT_EXCEEDED";
  if (s.includes("RUNTIME")) return "RUNTIME_ERROR";
  if (s.includes("COMPILE")) return "COMPILE_ERROR";
  return "UNKNOWN";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    let user = await getCurrentUser();

    // Explicit Bearer token auth support for extension cross-origin calls
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
        { error: "Authentication required to sync LeetCode data." },
        { status: 401, headers: corsHeaders },
      );
    }

    const json = await request.json();
    const data = syncPayloadSchema.parse(json);
    const errors: string[] = [];

    // 1. Monotonic upsert for DailyActivity
    let syncedDaysCount = 0;
    if (data.calendar.length > 0) {
      const existingActivities = await prisma.dailyActivity.findMany({
        where: { userId: user.id, source: "LEETCODE" },
        select: { id: true, date: true, count: true },
      });
      const existingMap = new Map(existingActivities.map((a) => [a.date, a]));

      const creates: { userId: string; date: string; count: number; source: "LEETCODE" }[] = [];
      const updates: { id: string; count: number }[] = [];

      for (const item of data.calendar) {
        const existing = existingMap.get(item.date);
        if (existing) {
          if (item.count > existing.count) {
            updates.push({ id: existing.id, count: item.count });
          }
        } else if (item.count > 0) {
          creates.push({
            userId: user.id,
            date: item.date,
            count: item.count,
            source: "LEETCODE",
          });
        }
      }

      if (creates.length > 0) {
        await prisma.dailyActivity.createMany({
          data: creates,
          skipDuplicates: true,
        });
      }

      for (const upd of updates) {
        await prisma.dailyActivity.update({
          where: { id: upd.id },
          data: { count: upd.count },
        });
      }

      syncedDaysCount = creates.length + updates.length;
    }

    // 2. Process Solved Problems & Submissions
    const allSlugs = new Set<string>();
    for (const p of data.solvedProblems) allSlugs.add(p.slug);
    for (const s of data.submissions) allSlugs.add(s.problemSlug);

    const existingProblems = await prisma.problem.findMany({
      where: { slug: { in: Array.from(allSlugs) } },
      select: { id: true, slug: true },
    });
    const problemMap = new Map<string, string>(
      existingProblems.map((p) => [p.slug, p.id]),
    );

    const solvedProblemsMap = new Map(
      data.solvedProblems.map((p) => [p.slug, p]),
    );

    let syncedProblemsCount = 0;

    // Fast-upsert missing problems from solvedProblems metadata (zero-spam, no 429)
    for (const slug of allSlugs) {
      if (problemMap.has(slug)) continue;

      const meta = solvedProblemsMap.get(slug);
      if (meta) {
        try {
          const created = await prisma.problem.create({
            data: {
              slug,
              title: meta.title || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
              leetcodeId: meta.leetcodeId ?? null,
              difficulty: normalizeDifficulty(meta.difficulty),
              url: `https://leetcode.com/problems/${slug}/`,
            },
            select: { id: true },
          });
          problemMap.set(slug, created.id);
          syncedProblemsCount++;
        } catch (err: any) {
          errors.push(`Failed to register problem ${slug}: ${err.message}`);
        }
      }
    }

    // For any remaining missing problems (e.g. from submissions list only), fetch via syncProblem with 300ms throttling
    for (const slug of allSlugs) {
      if (problemMap.has(slug)) continue;

      try {
        await sleep(300);
        const synced = await syncProblem(slug);
        problemMap.set(slug, synced.id);
        syncedProblemsCount++;
      } catch (err: any) {
        errors.push(`Failed to fetch problem ${slug} from LeetCode: ${err.message}`);
      }
    }

    // 3. Upsert Submissions (Idempotent via @@unique([userId, source, externalId]))
    let syncedSubmissionsCount = 0;
    for (const sub of data.submissions) {
      const problemId = problemMap.get(sub.problemSlug);
      if (!problemId) {
        continue;
      }

      const submittedAtDate = new Date(
        sub.timestamp > 1e11 ? sub.timestamp : sub.timestamp * 1000,
      );

      try {
        await prisma.submission.upsert({
          where: {
            userId_source_externalId: {
              userId: user.id,
              source: "LEETCODE",
              externalId: sub.externalId,
            },
          },
          create: {
            userId: user.id,
            problemId,
            source: "LEETCODE",
            externalId: sub.externalId,
            status: mapSubmissionStatus(sub.status),
            language: sub.language || "unknown",
            runtimeMs: sub.runtimeMs ?? null,
            memoryBytes: sub.memoryBytes ? BigInt(sub.memoryBytes) : null,
            submittedAt: submittedAtDate,
          },
          update: {
            status: mapSubmissionStatus(sub.status),
            runtimeMs: sub.runtimeMs ?? undefined,
            memoryBytes: sub.memoryBytes ? BigInt(sub.memoryBytes) : undefined,
            submittedAt: submittedAtDate,
          },
        });
        syncedSubmissionsCount++;
      } catch (err: any) {
        errors.push(`Failed to upsert submission ${sub.externalId}: ${err.message}`);
      }
    }

    // 4. Update User sync stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSyncedAt: new Date(),
        leetcodeUsername: data.leetcodeUsername || undefined,
      },
    });

    // 5. Revalidate dashboard path
    revalidatePath("/problems");

    return NextResponse.json(
      {
        success: true,
        syncedSubmissions: syncedSubmissionsCount,
        syncedProblems: syncedProblemsCount,
        calendarDays: syncedDaysCount,
        errors,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid sync payload", issues: error.issues },
        { status: 400, headers: corsHeaders },
      );
    }

    console.error("LeetCode sync error:", error);
    return NextResponse.json(
      { error: "Internal server error during LeetCode sync" },
      { status: 500, headers: corsHeaders },
    );
  }
}
