import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "inventtisi_auth";
export const ADMIN_COOKIE_NAME = "admin_auth";

export type AuthRole = "admin" | "personel" | "musteri";

type TokenPayload = {
  email: string;
  id: number;
  rol: AuthRole;
};

function jwtSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.ADMIN_PANEL_KEY ||
    "inventtisi-local-secret-change-me"
  );
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
    return bcrypt.compare(password, storedHash);
  }

  return password === storedHash;
}

export function signAuthToken(payload: TokenPayload) {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      ad: true,
      createdAt: true,
      email: true,
      id: true,
      lastLoginAt: true,
      rol: true,
      soyad: true,
    },
  });
}

export async function requireAdmin() {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value === "1") {
    return true;
  }

  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyAuthToken(token) : null;

  return payload?.rol === "admin";
}
