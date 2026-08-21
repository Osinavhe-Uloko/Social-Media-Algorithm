"use client";

import { useEffect, useState } from "react";
import CorrelationHeatmap from "@/components/charts/CorrelationHeatmap";

interface Predictor {
  name: string;
  coefficient: number;
  standardError: number;
  tStat: number;
  pValue: number;
  significant: boolean;
}

interface Regression {
  n: number;
  k: number;
  df: number;
  intercept: Predictor;
  predictors: Predictor[];
  rSquared: number;
  adjustedRSquared: number;
  fStat: number;
  fPValue: number;
}

interface AnalysisResponse {
  correlationMatrix: Record<string, Record<string, number>>;
  correlationVars: string[];
  regression: Regression | null;
  regressionError: string | null;
  regressionMeta: { dv: string; n: number; moderation: boolean };
}

function PredictorRow({ p }: { p: Predictor }) {
  return (
    <tr>
      <td className="px-3 py-2 font-medium text-slate-700">{p.name}</td>
      <td className="px-3 py-2">{p.coefficient.toFixed(3)}</td>
      <td className="px-3 py-2">{p.standardError.toFixed(3)}</td>
      <td className="px-3 py-2">{p.tStat.toFixed(2)}</td>
      <td className="px-3 py-2">
        {isNaN(p.pValue) ? "—" : p.pValue.toFixed(3)}
        {p.significant && <span className="ml-1 text-brand-600">*</span>}
      </td>
    </tr>
  );
}

export default function AnalysisPage() {
  const [dv, setDv] = useState<"gpa" | "impact">("gpa");
  const [moderation, setModeration] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analysis?dv=${dv}&moderation=${moderation}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [dv, moderation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Statistical analysis</h1>
        <p className="text-sm text-slate-500">
          Live descriptive and inferential analysis over submitted assessments,
          matching the constructs from the conceptual framework (Chapter Two,
          Section 2.2.7).
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900">Correlation matrix</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pearson product-moment correlation, pairwise complete observations.
        </p>
        <div className="mt-4">
          {data && (
            <CorrelationHeatmap
              vars={data.correlationVars}
              matrix={data.correlationMatrix}
            />
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Multiple linear regression
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ordinary least squares, computed server-side over live response
              data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <button
                className={`px-3 py-1.5 text-xs font-medium ${
                  dv === "gpa" ? "bg-brand-600 text-white" : "bg-white text-slate-600"
                }`}
                onClick={() => setDv("gpa")}
              >
                DV: CGPA
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium ${
                  dv === "impact" ? "bg-brand-600 text-white" : "bg-white text-slate-600"
                }`}
                onClick={() => setDv("impact")}
              >
                DV: Academic Impact
              </button>
            </div>
            <button
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                moderation
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
              onClick={() => setModeration((m) => !m)}
            >
              {moderation ? "Interaction terms: on" : "Add AL × IV interaction terms"}
            </button>
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-slate-400">Running regression...</p>}

        {!loading && data?.regressionError && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {data.regressionError}
          </div>
        )}

        {!loading && data?.regression && (
          <div className="mt-4">
            <p className="text-xs text-slate-400">
              DV: {data.regressionMeta.dv} &middot; n = {data.regression.n} &middot;{" "}
              R² = {data.regression.rSquared.toFixed(3)} &middot; Adjusted R² ={" "}
              {data.regression.adjustedRSquared.toFixed(3)} &middot; F(
              {data.regression.k}, {data.regression.df}) ={" "}
              {data.regression.fStat.toFixed(2)}
              {!isNaN(data.regression.fPValue) &&
                `, p = ${data.regression.fPValue.toFixed(3)}`}
            </p>
            <div className="overflow-x-auto">
              <table className="mt-3 min-w-full divide-y divide-slate-200 text-sm">
                <thead className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Predictor</th>
                    <th className="px-3 py-2">B</th>
                    <th className="px-3 py-2">SE</th>
                    <th className="px-3 py-2">t</th>
                    <th className="px-3 py-2">p</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <PredictorRow p={data.regression.intercept} />
                  {data.regression.predictors.map((p) => (
                    <PredictorRow key={p.name} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              * p &lt; 0.05. AL × IV rows, when enabled, test algorithmic
              literacy as a moderator of that predictor&apos;s effect, per the
              conceptual framework in Chapter Two. This is a demonstration
              computation over live self-reported data — the thesis&apos;s
              authoritative statistical analysis is reported separately in
              Chapter Four using SPSS.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
