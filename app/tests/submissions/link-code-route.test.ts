import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service before importing the route handler.
const { linkMock } = vi.hoisted(() => ({
  linkMock: vi.fn(),
}));

vi.mock("@/lib/submissions/link-code", () => ({
  linkSubmissionToCode: linkMock,
}));

// Minimal NextResponse shim — the real one is not available in a unit test.
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      _body: body,
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { PATCH } from "@/app/api/submissions/[id]/code/route";

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body: unknown) {
  return { json: async () => body } as unknown as Request;
}

describe("PATCH /api/submissions/[id]/code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only { id, codeId } when linking — BigInt fields are excluded", async () => {
    // The full Submission from Prisma includes memoryBytes as BigInt,
    // which would crash JSON.stringify. The route must strip it.
    linkMock.mockResolvedValue({
      id: "submission-1",
      codeId: "code-1",
      memoryBytes: BigInt("123456789"),
      runtimeMs: 42,
      status: "ACCEPTED",
    });

    const response = await PATCH(
      makeRequest({ codeId: "code-1" }),
      makeContext("submission-1"),
    );

    const body = await response.json();

    expect(body).toEqual({ id: "submission-1", codeId: "code-1" });
    expect(body).not.toHaveProperty("memoryBytes");
    expect(body).not.toHaveProperty("runtimeMs");
    expect(body).not.toHaveProperty("status");
  });

  it("returns { id, codeId: null } when unlinking", async () => {
    linkMock.mockResolvedValue({
      id: "submission-1",
      codeId: null,
      memoryBytes: BigInt("123456789"),
    });

    const response = await PATCH(
      makeRequest({ codeId: null }),
      makeContext("submission-1"),
    );

    const body = await response.json();

    expect(body).toEqual({ id: "submission-1", codeId: null });
  });

  it("returns 400 for an invalid request body", async () => {
    const response = await PATCH(
      makeRequest({ codeId: 99 }), // number is not valid; must be string | null
      makeContext("submission-1"),
    );

    expect(response.status).toBe(400);
    expect(linkMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the code is not found", async () => {
    linkMock.mockRejectedValue(new Error("Code not found"));

    const response = await PATCH(
      makeRequest({ codeId: "missing-code" }),
      makeContext("submission-1"),
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Code not found" });
  });

  it("returns 404 when the submission is not found", async () => {
    linkMock.mockRejectedValue(new Error("Submission not found"));

    const response = await PATCH(
      makeRequest({ codeId: "code-1" }),
      makeContext("missing-submission"),
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Submission not found" });
  });

  it("returns 400 when the code belongs to a different problem", async () => {
    linkMock.mockRejectedValue(
      new Error("Code does not belong to the submission's problem"),
    );

    const response = await PATCH(
      makeRequest({ codeId: "code-other-problem" }),
      makeContext("submission-1"),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      error: "Code does not belong to the submission's problem",
    });
  });
});
