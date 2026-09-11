import { describe, it, expect, afterAll } from "vitest";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

describe("complete signup lifecycle test", () => {
  const timestamp = Date.now();
  const email = `testuser_${timestamp}@example.com`;
  const username = `testuser${timestamp}`;

  afterAll(async () => {
    // Clean up created user
    await prisma.user.deleteMany({ where: { email } });
  });

  it(
    "creates user, account, and session in db",
    async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        body: JSON.stringify({
          email,
          password: "password123!",
          name: "Lifecycle User",
          username,
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(200);

      // Check DB records
      const dbUser = await prisma.user.findUnique({ where: { email } });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.username).toBe(username);

      const dbAccount = await prisma.account.findFirst({
        where: { userId: dbUser?.id },
      });
      expect(dbAccount).not.toBeNull();

      const dbSession = await prisma.session.findFirst({
        where: { userId: dbUser?.id },
      });
      expect(dbSession).not.toBeNull();
    },
    20000,
  );
});


