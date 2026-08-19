import { ConstructKey, QUESTIONS, gpaValueForBand } from "./constructs";

export type AnswerMap = Record<string, number>;

function scoreForConstruct(answers: AnswerMap, construct: ConstructKey) {
  const items = QUESTIONS.filter((q) => q.construct === construct);
  const values = items.map((q) => {
    const raw = answers[q.id];
    if (typeof raw !== "number" || raw < 1 || raw > 5) {
      throw new Error(`Missing or invalid answer for question ${q.id}`);
    }
    return q.reverse ? 6 - raw : raw;
  });
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(mean * 100) / 100;
}

export interface ScoredResult {
  acpScore: number;
  emdScore: number;
  tsaScore: number;
  alScore: number;
  academicImpactScore: number;
  exposureIndex: number;
  gpaValue: number | null;
}

export function scoreAssessment(
  answers: AnswerMap,
  cgpaBand: string | null
): ScoredResult {
  const acpScore = scoreForConstruct(answers, "ACP");
  const emdScore = scoreForConstruct(answers, "EMD");
  const tsaScore = scoreForConstruct(answers, "TSA");
  const alScore = scoreForConstruct(answers, "AL");
  const academicImpactScore = scoreForConstruct(answers, "AP");

  const exposureIndex =
    Math.round(((acpScore + emdScore + tsaScore) / 3) * 100) / 100;

  const gpaValue = cgpaBand ? gpaValueForBand(cgpaBand) : null;

  return {
    acpScore,
    emdScore,
    tsaScore,
    alScore,
    academicImpactScore,
    exposureIndex,
    gpaValue,
  };
}

export type Band = "Low" | "Moderate" | "High";

export function bandFor(score: number): Band {
  if (score <= 2.4) return "Low";
  if (score <= 3.4) return "Moderate";
  return "High";
}

const INTERPRETATION: Record<ConstructKey, Record<Band, string>> = {
  ACP: {
    Low: "Your feed feels relatively generic or chronological — algorithmic personalisation does not appear to be strongly shaping what you see.",
    Moderate:
      "You notice a moderate degree of tailoring in your feed — some content clearly follows your past behaviour, but it isn't overwhelming.",
    High: "Your feed feels heavily personalised — the platform is actively predicting and serving what is most likely to hold your attention (Anandhan et al., 2018).",
  },
  EMD: {
    Low: "Design features such as autoplay, infinite scroll, and notifications don't seem to pull you back in strongly.",
    Moderate:
      "You sometimes notice design features making it harder to stop — occasional longer-than-planned sessions.",
    High: "Engagement-maximising design is strongly shaping your behaviour — infinite scroll, autoplay, and notifications are frequently extending sessions past what you intended (Coursera, 2025).",
  },
  TSA: {
    Low: "Algorithm-curated platforms don't appear to be displacing much of your study time.",
    Moderate:
      "There is a moderate amount of study-time displacement — some sessions run longer than planned during periods you meant to study.",
    High: "A substantial amount of your intended study time is being displaced by algorithm-curated platforms.",
  },
  AL: {
    Low: "Your algorithmic literacy is low — you may not be fully aware that your feed is personalised, which the literature suggests leaves you less able to set boundaries around it (Brodsky et al., 2021).",
    Moderate:
      "You have a working, if partly intuitive, understanding of how your feed is curated (Swart, 2021).",
    High: "You have a strong, deliberate understanding of how your feed is curated — this awareness can act as a buffer, blunting the effect of personalisation and design pull on your study time.",
  },
  AP: {
    Low: "Little self-reported interference with your study time or concentration.",
    Moderate: "Some self-reported interference with study time, focus, or deadlines.",
    High: "Substantial self-reported interference — social media use is frequently cutting into study time, concentration, or deadlines.",
  },
};

export function interpret(construct: ConstructKey, score: number) {
  return INTERPRETATION[construct][bandFor(score)];
}

export function moderationNarrative(
  exposureIndex: number,
  alScore: number
): string {
  const exposureBand = bandFor(exposureIndex);
  const alBand = bandFor(alScore);

  if (exposureBand === "High" && alBand === "High") {
    return "You report high algorithmic exposure, but also high algorithmic literacy. The conceptual framework behind this study treats literacy as a moderator: your awareness may be buffering some of the effect this exposure would otherwise have on your study time — but exposure this high is still worth actively managing.";
  }
  if (exposureBand === "High" && alBand !== "High") {
    return "You report high algorithmic exposure combined with only low-to-moderate algorithmic literacy. This is the combination the research literature flags as highest-risk: without a strong buffer of awareness, engagement-maximising feeds are more likely to erode study time without your noticing how it happened (Bandura, 1997).";
  }
  if (exposureBand === "Low" && alBand === "Low") {
    return "Your algorithmic exposure is currently low, but so is your literacy. Exposure can rise quickly as usage patterns change, so building awareness now is still worthwhile.";
  }
  return "Your algorithmic exposure is moderate. Algorithmic literacy is treated as a moderating factor in this study — the higher it is, the more it can blunt exposure's effect on your study time.";
}
