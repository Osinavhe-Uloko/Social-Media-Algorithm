import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password, matricNumber, faculty, level, gender, ageBand, primaryPlatform } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      matricNumber: matricNumber || null,
      faculty: faculty || null,
      level: level || null,
      gender: gender || null,
      ageBand: ageBand || null,
      primaryPlatform: primaryPlatform || null,
      role: "STUDENT",
    },
  });

  const token = await createSessionToken({
    sub: user.id,
    role: user.role as "STUDENT" | "ADMIN",
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role as "STUDENT" | "ADMIN",
  });
}
