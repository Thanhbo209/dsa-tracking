import { revalidatePath } from "next/cache";

/**
 * On-demand cache invalidation helper for public user profiles.
 * Evicts cached Next.js ISR pages for /u/[username] and optionally /u/[username]/[problemSlug].
 */
export function revalidatePublicProfile(
  user?:
    | { username?: string | null; displayUsername?: string | null }
    | string
    | null,
  problemSlug?: string | null,
) {
  if (!user) return;
  const usernames =
    typeof user === "string"
      ? [user]
      : [user.username, user.displayUsername].filter((u): u is string => Boolean(u));

  for (const name of Array.from(new Set(usernames))) {
    try {
      revalidatePath(`/u/${name}`, "page");
      if (problemSlug) {
        revalidatePath(`/u/${name}/${problemSlug}`, "page");
      }
    } catch (err) {
      // Gracefully ignore errors if called outside of Next.js server context (e.g. tests)
      console.warn(`[revalidatePublicProfile] Failed to revalidate for ${name}:`, err);
    }
  }
}
