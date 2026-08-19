import bcrypt from "bcryptjs";

// Node-only (bcrypt) auth helpers. Session/JWT helpers live in ./session,
// which stays Edge-runtime-safe for use in middleware.ts.
export * from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
