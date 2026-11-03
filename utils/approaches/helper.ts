export function stripStatusSuffix(name: string): string {
  return name
    .replace(/(\s*\((?:My Accepted Implementation|My Attempt)\))+$/g, "")
    .trim();
}

export function getStatusBadge(name: string): string | null {
  const match = name.match(/\((My Accepted Implementation|My Attempt)\)\s*$/);
  return match ? match[1] : null;
}

/** Extract a plain language slug from storage strings like
 *  "Actual accepted submission code (python, 4ms)." → "python" */
export function extractLanguage(langField: string): string {
  if (!/[( ]/.test(langField)) return langField.toLowerCase();
  const m = langField.match(/\(([a-zA-Z0-9_+#]+)/);
  return m ? m[1].toLowerCase() : langField.toLowerCase();
}
