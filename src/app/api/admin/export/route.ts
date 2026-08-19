import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

const COLUMNS = [
  "id",
  "createdAt",
  "faculty",
  "level",
  "gender",
  "ageBand",
  "primaryPlatform",
  "acpScore",
  "emdScore",
  "tsaScore",
  "alScore",
  "exposureIndex",
  "academicImpactScore",
  "cgpaBand",
  "gpaValue",
] as const;

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "asc" },
  });

  const header = COLUMNS.join(",");
  const rows = responses.map((r) =>
    COLUMNS.map((col) => csvEscape((r as Record<string, unknown>)[col])).join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="smaias-responses-${Date.now()}.csv"`,
    },
  });
}
