import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthSession } from "./types";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "todo-app-dev-jwt-super-secret-key-12345";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = "auth_token";
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: AuthSession): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload && payload.userId && payload.email) {
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        name: (payload.name as string) || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from server cookies.
 * Strictly derives the user from the verified cryptographically-signed token.
 */
export async function getSessionUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

export const AUTH_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};
