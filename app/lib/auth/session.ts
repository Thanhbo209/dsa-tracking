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

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      username: (session.user as any).username ?? null,
      displayUsername: (session.user as any).displayUsername ?? null,
      bio: (session.user as any).bio ?? null,
      image: session.user.image ?? null,
      createdAt: session.user.createdAt,
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
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
