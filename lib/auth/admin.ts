import type { CurrentUser } from "./session";

/**
 * Determines whether a user has administrative access to view AI Usage & Quotas.
 *
 * Policy:
 * 1. If ADMIN_EMAILS environment variable is configured (comma-separated email list),
 *    only authenticated users whose email matches are granted admin access.
 * 2. If ADMIN_EMAILS is not set, any authenticated user is granted access
 *    (intentional default for single-user self-hosted installations).
 */
export function isAdminUser(user: CurrentUser | null): boolean {
  if (!user) {
    return false;
  }

  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv || adminEmailsEnv.trim() === "") {
    return true;
  }

  const allowedEmails = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(user.email.toLowerCase());
}
