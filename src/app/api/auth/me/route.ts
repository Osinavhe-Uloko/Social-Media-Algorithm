import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      faculty: true,
      level: true,
      gender: true,
      ageBand: true,
      primaryPlatform: true,
      matricNumber: true,
    },
  });

  return NextResponse.json({ user });
}
