import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TrendLine from "@/components/charts/TrendLine";

export default async function HistoryPage() {
  const session = await getSession();
  const responses = await prisma.response.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: "asc" },
  });

  if (responses.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-slate-500">
        No attempts yet. Take the assessment to see your history here.
      </div>
    );
  }

  const trendData = responses.map((r) => ({
    label: new Date(r.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    acpScore: r.acpScore,
    emdScore: r.emdScore,
    tsaScore: r.tsaScore,
    alScore: r.alScore,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Your history</h1>

      {responses.length > 1 && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Trend across attempts</h2>
          <TrendLine data={trendData} />
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">ACP</th>
              <th className="px-4 py-3">EMD</th>
              <th className="px-4 py-3">TSA</th>
              <th className="px-4 py-3">AL</th>
              <th className="px-4 py-3">Exposure Index</th>
              <th className="px-4 py-3">Academic Impact</th>
              <th className="px-4 py-3">CGPA band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...responses].reverse().map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">{r.acpScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.emdScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.tsaScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.alScore.toFixed(2)}</td>
                <td className="px-4 py-3 font-medium">{r.exposureIndex.toFixed(2)}</td>
                <td className="px-4 py-3">{r.academicImpactScore.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">{r.cgpaBand ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
