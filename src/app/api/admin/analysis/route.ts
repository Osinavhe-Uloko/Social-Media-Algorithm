import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { pearsonCorrelation, multipleLinearRegression } from "@/lib/stats";

const CORRELATION_VARS = [
  { key: "acpScore", label: "ACP" },
  { key: "emdScore", label: "EMD" },
  { key: "tsaScore", label: "TSA" },
  { key: "alScore", label: "AL" },
  { key: "academicImpactScore", label: "Academic Impact" },
  { key: "gpaValue", label: "GPA" },
] as const;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const dv = searchParams.get("dv") === "impact" ? "impact" : "gpa";
  const moderation = searchParams.get("moderation") === "true";

  const all = await prisma.response.findMany();

  // ---- Correlation matrix (pairwise complete observations) ----
  const matrix: Record<string, Record<string, number>> = {};
  for (const rowVar of CORRELATION_VARS) {
    matrix[rowVar.label] = {};
    for (const colVar of CORRELATION_VARS) {
      const pairs = all
        .map((r) => [
          (r as Record<string, unknown>)[rowVar.key] as number | null,
          (r as Record<string, unknown>)[colVar.key] as number | null,
        ])
        .filter(
          (p): p is [number, number] => p[0] !== null && p[1] !== null
        );
      const xs = pairs.map((p) => p[0]);
      const ys = pairs.map((p) => p[1]);
      matrix[rowVar.label][colVar.label] =
        pairs.length >= 2 ? Math.round(pearsonCorrelation(xs, ys) * 1000) / 1000 : NaN;
    }
  }

  // ---- Multiple linear regression ----
  const rows =
    dv === "gpa"
      ? all.filter((r) => r.gpaValue !== null && r.gpaValue !== undefined)
      : all;

  let regression = null;
  let regressionError: string | null = null;

  try {
    const y = rows.map((r) => (dv === "gpa" ? (r.gpaValue as number) : r.academicImpactScore));
    const predictors: Record<string, number[]> = {
      ACP: rows.map((r) => r.acpScore),
      EMD: rows.map((r) => r.emdScore),
      TSA: rows.map((r) => r.tsaScore),
      AL: rows.map((r) => r.alScore),
    };
    if (moderation) {
      predictors["ACP x AL"] = rows.map((r) => r.acpScore * r.alScore);
      predictors["EMD x AL"] = rows.map((r) => r.emdScore * r.alScore);
      predictors["TSA x AL"] = rows.map((r) => r.tsaScore * r.alScore);
    }
    regression = multipleLinearRegression(y, predictors);
  } catch (e) {
    regressionError = e instanceof Error ? e.message : "Regression failed.";
  }

  return NextResponse.json({
    correlationMatrix: matrix,
    correlationVars: CORRELATION_VARS.map((v) => v.label),
    regression,
    regressionError,
    regressionMeta: {
      dv: dv === "gpa" ? "Self-reported CGPA (numeric midpoint)" : "Self-reported academic impact score",
      n: rows.length,
      moderation,
    },
  });
}
