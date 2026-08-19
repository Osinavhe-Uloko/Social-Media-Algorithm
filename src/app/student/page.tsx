import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CONSTRUCT_META } from "@/lib/constructs";
import { bandFor, interpret, moderationNarrative } from "@/lib/scoring";
import ConstructRadar from "@/components/charts/ConstructRadar";
import ScoreBars from "@/components/charts/ScoreBars";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const latest = await prisma.response.findFirst({
    where: { userId: session!.sub },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          You haven&apos;t taken the assessment yet
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          It takes about three minutes and covers four short sections:
          personalisation, design pull, time on platform, and algorithmic
          literacy.
        </p>
        <Link href="/student/assessment" className="btn-primary mt-6 inline-flex">
          Start the assessment
        </Link>
      </div>
    );
  }

  const radarData = [
    { construct: "ACP", score: latest.acpScore },
    { construct: "EMD", score: latest.emdScore },
    { construct: "TSA", score: latest.tsaScore },
    { construct: "AL", score: latest.alScore },
  ];
  const barData = [
    { construct: "ACP", score: latest.acpScore, band: bandFor(latest.acpScore) },
    { construct: "EMD", score: latest.emdScore, band: bandFor(latest.emdScore) },
    { construct: "TSA", score: latest.tsaScore, band: bandFor(latest.tsaScore) },
    { construct: "AL", score: latest.alScore, band: bandFor(latest.alScore) },
  ];

  const narrative = moderationNarrative(latest.exposureIndex, latest.alScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your results</h1>
          <p className="text-sm text-slate-500">
            Last submitted {new Date(latest.createdAt).toLocaleString()}
          </p>
        </div>
        <Link href="/student/assessment" className="btn-secondary">
          Retake assessment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Construct profile</h2>
          <ConstructRadar data={radarData} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Scores by construct</h2>
          <ScoreBars data={barData} />
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-600" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-600" /> High
            </span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Algorithmic Exposure Index</h2>
          <span className="badge bg-brand-50 text-brand-700">
            {latest.exposureIndex.toFixed(2)} / 5.00 &middot; {bandFor(latest.exposureIndex)}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Mean of Content Personalisation, Engagement-Maximising Design, and
          Time on Platform &mdash; the three factors this study treats as
          direct drivers of academic impact. Algorithmic Literacy is kept
          separate below because it is treated as a{" "}
          <strong>moderating</strong> variable, not a direct cause.
        </p>
        <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
          {narrative}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["ACP", "EMD", "TSA", "AL"] as const).map((key) => {
          const score =
            key === "ACP"
              ? latest.acpScore
              : key === "EMD"
              ? latest.emdScore
              : key === "TSA"
              ? latest.tsaScore
              : latest.alScore;
          return (
            <div key={key} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">
                  {CONSTRUCT_META[key].name}
                </h3>
                <span className="badge bg-slate-100 text-slate-700">
                  {score.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{interpret(key, score)}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h3 className="font-medium text-slate-900">
          {CONSTRUCT_META.AP.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {interpret("AP", latest.academicImpactScore)}
        </p>
        {latest.cgpaBand && (
          <p className="mt-2 text-xs text-slate-400">
            Self-reported CGPA band: {latest.cgpaBand}
          </p>
        )}
      </div>
    </div>
  );
}
