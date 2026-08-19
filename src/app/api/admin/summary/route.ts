import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { mean, sampleStdDev } from "@/lib/stats";

function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K | null | undefined
) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item) ?? "Unspecified";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
  });
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });

  const metric = (key: keyof (typeof responses)[number]) =>
    responses.map((r) => r[key] as number);

  const descriptives = {
    n: responses.length,
    studentCount,
    acp: { mean: mean(metric("acpScore")), sd: sampleStdDev(metric("acpScore")) },
    emd: { mean: mean(metric("emdScore")), sd: sampleStdDev(metric("emdScore")) },
    tsa: { mean: mean(metric("tsaScore")), sd: sampleStdDev(metric("tsaScore")) },
    al: { mean: mean(metric("alScore")), sd: sampleStdDev(metric("alScore")) },
    exposureIndex: {
      mean: mean(metric("exposureIndex")),
      sd: sampleStdDev(metric("exposureIndex")),
    },
    academicImpact: {
      mean: mean(metric("academicImpactScore")),
      sd: sampleStdDev(metric("academicImpactScore")),
    },
    gpa: (() => {
      const values = responses
        .map((r) => r.gpaValue)
        .filter((v): v is number => v !== null && v !== undefined);
      return { mean: mean(values), sd: sampleStdDev(values), n: values.length };
    })(),
  };

  function breakdown(keyFn: (r: (typeof responses)[number]) => string | null) {
    const groups = groupBy(responses, keyFn);
    return Array.from(groups.entries())
      .map(([key, items]) => ({
        key,
        n: items.length,
        meanExposureIndex:
          Math.round(mean(items.map((i) => i.exposureIndex)) * 100) / 100,
        meanAcademicImpact:
          Math.round(mean(items.map((i) => i.academicImpactScore)) * 100) / 100,
      }))
      .sort((a, b) => b.n - a.n);
  }

  const breakdowns = {
    faculty: breakdown((r) => r.faculty),
    level: breakdown((r) => r.level),
    gender: breakdown((r) => r.gender),
    primaryPlatform: breakdown((r) => r.primaryPlatform),
  };

  const recent = responses.slice(0, 10);

  return NextResponse.json({ descriptives, breakdowns, recent });
}
