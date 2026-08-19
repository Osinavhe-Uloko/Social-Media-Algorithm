import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { submitAssessmentSchema } from "@/lib/validation";
import { QUESTIONS } from "@/lib/constructs";
import { scoreAssessment } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submitAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { answers, cgpaBand } = parsed.data;

  const missing = QUESTIONS.filter((q) => typeof answers[q.id] !== "number");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing answers for: ${missing.map((q) => q.id).join(", ")}` },
      { status: 400 }
    );
  }

  let scored;
  try {
    scored = scoreAssessment(answers, cgpaBand ?? null);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Scoring failed." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const response = await prisma.response.create({
    data: {
      userId: user.id,
      answers: JSON.stringify(answers),
      acpScore: scored.acpScore,
      emdScore: scored.emdScore,
      tsaScore: scored.tsaScore,
      alScore: scored.alScore,
      exposureIndex: scored.exposureIndex,
      academicImpactScore: scored.academicImpactScore,
      cgpaBand: cgpaBand || null,
      gpaValue: scored.gpaValue,
      faculty: user.faculty,
      level: user.level,
      gender: user.gender,
      ageBand: user.ageBand,
      primaryPlatform: user.primaryPlatform,
    },
  });

  return NextResponse.json({ response });
}
