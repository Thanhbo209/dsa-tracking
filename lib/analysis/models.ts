export const DEFAULT_PRIMARY_MODEL = "gemini-3.6-flash";
export const DEFAULT_FALLBACK_MODEL = "gemini-3.5-flash-lite";

export function getPrimaryModel(): string {
  return process.env.GEMINI_PRIMARY_MODEL || process.env.GEMINI_MODEL || DEFAULT_PRIMARY_MODEL;
}

export function getFallbackModel(): string {
  return process.env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL;
}

/**
 * Returns the opposite model given the current active model.
 * If current is primary, returns fallback; otherwise returns primary.
 */
export function getOppositeModel(currentModel: string): string {
  const primary = getPrimaryModel();
  const fallback = getFallbackModel();

  if (currentModel === primary) {
    return fallback;
  }
  return primary;
}

/**
 * Formats raw model identifier strings into human-friendly labels.
 * E.g.:
 * - "gemini-2.5-flash" -> "Gemini 2.5 Flash"
 * - "gemini-3.5-flash-lite" -> "Gemini 3.5 Flash-Lite"
 * - "gemini-3.6-flash" -> "Gemini 3.6 Flash"
 * - Any other model string falls back to word capitalization splitting hyphens.
 * Returns null if modelName is missing or empty.
 */
export function formatModelDisplayName(modelName: string | null | undefined): string | null {
  if (!modelName || modelName.trim() === "") {
    return null;
  }
  const clean = modelName.replace(/^models\//, "");
  if (clean === "gemini-2.5-flash") return "Gemini 2.5 Flash";
  if (clean === "gemini-3.5-flash-lite") return "Gemini 3.5 Flash-Lite";
  if (clean === "gemini-3.6-flash") return "Gemini 3.6 Flash";

  return clean
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
