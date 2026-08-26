import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ntm_session";

export interface SessionPayload {
  email: string;
  name: string;
  role: string;
}

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET ?? "dev-insecure-secret";
  return new TextEncoder().encode(value);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.email !== "string") return null;
    return {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: typeof payload.role === "string" ? payload.role : "MANAGER",
    };
  } catch {
    return null;
  }
}
