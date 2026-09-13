import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  displayUsername: string | null;
  bio: string | null;
  image: string | null;
  createdAt: Date;
}

/**
 * Centralized server-side current user resolution.
 * Reads the authenticated session from request headers/cookies.
 * Returns null safely if no authenticated session exists.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const user = session.user as typeof session.user & {
      username?: string | null;
      displayUsername?: string | null;
      bio?: string | null;
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username ?? null,
      displayUsername: user.displayUsername ?? null,
      bio: user.bio ?? null,
      image: user.image ?? null,
      createdAt: user.createdAt,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Failed to resolve current user:", error);
    return null;
  }
}

/**
 * Requires an authenticated user, throwing an Error (or returning 401 response)
 * when no user is logged in.
 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
