export interface AuthSignInRequest {
  endpoint: string;
  body: { email: string; password: string } | { username: string; password: string };
  isEmail: boolean;
}

/**
 * Resolves whether the user provided an email or username,
 * and produces the appropriate endpoint and payload for Better Auth.
 */
export function resolveAuthSignInRequest(
  identifier: string,
  password: string
): AuthSignInRequest {
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");
  return {
    isEmail,
    endpoint: isEmail ? "/api/auth/sign-in/email" : "/api/auth/sign-in/username",
    body: isEmail
      ? { email: trimmed, password }
      : { username: trimmed.toLowerCase(), password },
  };
}
