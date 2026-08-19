import { NextResponse } from "next/server";
import { QUESTIONS, CONSTRUCT_META, LIKERT_LABELS, CGPA_BANDS } from "@/lib/constructs";

export async function GET() {
  return NextResponse.json({
    questions: QUESTIONS,
    constructs: CONSTRUCT_META,
    likertLabels: LIKERT_LABELS,
    cgpaBands: CGPA_BANDS.map((b) => b.band),
  });
}
