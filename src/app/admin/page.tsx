import { prisma } from "@/lib/db";
import { mean, sampleStdDev } from "@/lib/stats";
import Link from "next/link";

function StatCard({
  label,
  meanValue,
  sd,
  suffix = "",
}: {
  label: string;
  meanValue: number;
  sd: number;
  suffix?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">
        {isNaN(meanValue) ? "—" : `${meanValue.toFixed(2)}${suffix}`}
      </div>
      <div className="text-xs text-slate-400">
        {isNaN(sd) ? "" : `SD ${sd.toFixed(2)}`}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const responses = await prisma.response.findMany({ orderBy: { createdAt: "desc" } });
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });

  const col = (key: "acpScore" | "emdScore" | "tsaScore" | "alScore" | "exposureIndex" | "academicImpactScore") =>
    responses.map((r) => r[key]);

  const gpaValues = responses
    .map((r) => r.gpaValue)
    .filter((v): v is number => v !== null && v !== undefined);

  function groupBy(keyFn: (r: (typeof responses)[number]) => string | null) {
    const map = new Map<string, (typeof responses)[number][]>();
    for (const r of responses) {
      const key = keyFn(r) ?? "Unspecified";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        n: items.length,
        meanExposureIndex: mean(items.map((i) => i.exposureIndex)),
      }))
      .sort((a, b) => b.n - a.n);
  }

  const facultyBreakdown = groupBy((r) => r.faculty);
  const platformBreakdown = groupBy((r) => r.primaryPlatform);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Research overview</h1>
          <p className="text-sm text-slate-500">
            {responses.length} completed assessments from {studentCount} registered students.
          </p>
        </div>
        <a href="/api/admin/export" className="btn-secondary">
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="ACP" meanValue={mean(col("acpScore"))} sd={sampleStdDev(col("acpScore"))} />
        <StatCard label="EMD" meanValue={mean(col("emdScore"))} sd={sampleStdDev(col("emdScore"))} />
        <StatCard label="TSA" meanValue={mean(col("tsaScore"))} sd={sampleStdDev(col("tsaScore"))} />
        <StatCard label="AL" meanValue={mean(col("alScore"))} sd={sampleStdDev(col("alScore"))} />
        <StatCard
          label="Exposure Index"
          meanValue={mean(col("exposureIndex"))}
          sd={sampleStdDev(col("exposureIndex"))}
        />
        <StatCard
          label="Academic Impact"
          meanValue={mean(col("academicImpactScore"))}
          sd={sampleStdDev(col("academicImpactScore"))}
        />
      </div>

      {gpaValues.length > 0 && (
        <div className="card p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Self-reported GPA (numeric midpoint, n = {gpaValues.length})
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {mean(gpaValues).toFixed(2)} <span className="text-sm font-normal text-slate-400">/ 5.00</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">By faculty</h2>
          <div className="mt-3 space-y-2">
            {facultyBreakdown.length === 0 && (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
            {facultyBreakdown.map((g) => (
              <div key={g.key} className="flex items-center gap-3 text-sm">
                <div className="w-40 truncate text-slate-600">{g.key}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, (g.meanExposureIndex / 5) * 100)}%` }}
                  />
                </div>
                <div className="w-24 text-right text-xs text-slate-400">
                  n={g.n}, x̄={g.meanExposureIndex.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">By primary platform</h2>
          <div className="mt-3 space-y-2">
            {platformBreakdown.length === 0 && (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
            {platformBreakdown.map((g) => (
              <div key={g.key} className="flex items-center gap-3 text-sm">
                <div className="w-40 truncate text-slate-600">{g.key}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, (g.meanExposureIndex / 5) * 100)}%` }}
                  />
                </div>
                <div className="w-24 text-right text-xs text-slate-400">
                  n={g.n}, x̄={g.meanExposureIndex.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 text-sm text-slate-500">
        Want correlation and regression analysis?{" "}
        <Link href="/admin/analysis" className="font-medium text-brand-600">
          Open the analysis panel →
        </Link>
      </div>
    </div>
  );
}
