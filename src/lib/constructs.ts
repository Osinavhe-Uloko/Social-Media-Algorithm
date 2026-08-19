// Questionnaire instrument for the Social Media Algorithm Impact Assessment
// and Awareness System.
//
// Every construct below is drawn directly from the conceptual framework set
// out in Chapter Two, Section 2.2.7 of the accompanying research:
//   - Three independent variables acting directly on academic performance:
//       ACP  Algorithmic Content Personalisation   (Section 2.2.2 / 2.2.3)
//       EMD  Engagement-Maximising Design Features (Section 2.2.4)
//       TSA  Time Spent on Algorithm-Curated Platforms
//   - One moderating variable:
//       AL   Algorithmic Literacy                  (Section 2.2.5)
//   - One dependent variable:
//       AP   Academic Performance / academic impact (Section 2.2.6)
//
// All items use a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly
// Agree). Items marked `reverse: true` are reverse-scored before averaging,
// so that a higher construct score always means "more of the construct"
// (e.g. a higher AL score always means higher literacy, even though item
// AL5 is worded so that agreement would otherwise pull the score down).

export type ConstructKey = "ACP" | "EMD" | "TSA" | "AL" | "AP";

export interface LikertQuestion {
  id: string;
  construct: ConstructKey;
  text: string;
  reverse?: boolean;
}

export const LIKERT_LABELS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const CONSTRUCT_META: Record<
  ConstructKey,
  { name: string; short: string; description: string; kind: "independent" | "moderator" | "dependent" }
> = {
  ACP: {
    name: "Algorithmic Content Personalisation",
    short: "Personalisation",
    description:
      "How strongly a student perceives their feed as individually tailored, rather than a generic or chronological stream.",
    kind: "independent",
  },
  EMD: {
    name: "Engagement-Maximising Design Features",
    short: "Design Pull",
    description:
      "How strongly interface mechanics such as infinite scroll, autoplay, and push notifications make it hard to disengage.",
    kind: "independent",
  },
  TSA: {
    name: "Time Spent on Algorithm-Curated Platforms",
    short: "Time on Platform",
    description:
      "How much study time is displaced by, or spent within, algorithm-curated apps.",
    kind: "independent",
  },
  AL: {
    name: "Algorithmic Literacy",
    short: "Literacy",
    description:
      "How well a student understands that their feed is algorithmically curated, and how deliberately they reason about or act on that understanding. Modelled as a moderator, not a direct cause.",
    kind: "moderator",
  },
  AP: {
    name: "Academic Performance / Impact",
    short: "Academic Impact",
    description:
      "Self-reported interference with study time, concentration, and deadlines, alongside a self-reported CGPA band.",
    kind: "dependent",
  },
};

export const QUESTIONS: LikertQuestion[] = [
  // Algorithmic Content Personalisation
  {
    id: "ACP1",
    construct: "ACP",
    text: "The content I see on my main social media app feels tailored specifically to my interests.",
  },
  {
    id: "ACP2",
    construct: "ACP",
    text: "I often see posts or videos related to something I only recently searched for, watched, or lingered on.",
  },
  {
    id: "ACP3",
    construct: "ACP",
    text: "My feed rarely shows things I would consider random or irrelevant to me.",
  },
  {
    id: "ACP4",
    construct: "ACP",
    text: "When I compare my feed with a friend's on the same app, we rarely see the same content.",
  },
  {
    id: "ACP5",
    construct: "ACP",
    text: "The app seems to \"know\" what will catch my attention before I consciously look for it.",
  },

  // Engagement-Maximising Design Features
  {
    id: "EMD1",
    construct: "EMD",
    text: "I find it hard to stop scrolling once I start, even when I only planned a quick check.",
  },
  {
    id: "EMD2",
    construct: "EMD",
    text: "Videos or posts keep playing automatically without me actively choosing to continue.",
  },
  {
    id: "EMD3",
    construct: "EMD",
    text: "Notifications pull my attention back to the app even when I have closed it to focus on schoolwork.",
  },
  {
    id: "EMD4",
    construct: "EMD",
    text: "I regularly end up spending longer on an app than I originally intended to.",
  },
  {
    id: "EMD5",
    construct: "EMD",
    text: "There is rarely a natural stopping point where the app signals I have seen everything new.",
  },

  // Time Spent on Algorithm-Curated Platforms
  {
    id: "TSA1",
    construct: "TSA",
    text: "On a typical day, I spend a large part of my free time on algorithm-curated apps (TikTok, Instagram, Facebook, X).",
  },
  {
    id: "TSA2",
    construct: "TSA",
    text: "I spend more time on social media during study periods than I plan to.",
  },
  {
    id: "TSA3",
    construct: "TSA",
    text: "Social media use has caused me to reduce time I had set aside for reading or assignments.",
  },
  {
    id: "TSA4",
    construct: "TSA",
    text: "I check algorithm-curated apps during lectures or study sessions.",
  },
  {
    id: "TSA5",
    construct: "TSA",
    text: "A short, planned break on social media often extends much longer than intended.",
  },

  // Algorithmic Literacy (moderator)
  {
    id: "AL1",
    construct: "AL",
    text: "I understand that my feed is arranged by an algorithm rather than shown in the order things were posted.",
  },
  {
    id: "AL2",
    construct: "AL",
    text: "I can explain, in general terms, what kind of data platforms use to decide what to show me.",
  },
  {
    id: "AL3",
    construct: "AL",
    text: "I actively think about why I am being shown a particular post or video.",
  },
  {
    id: "AL4",
    construct: "AL",
    text: "I know that two people who follow the same accounts can still see very different feeds.",
  },
  {
    id: "AL5",
    construct: "AL",
    text: "I have never thought about or looked into why my feed shows what it shows.",
    reverse: true,
  },

  // Academic Performance / Impact (dependent variable, Likert component)
  {
    id: "AP1",
    construct: "AP",
    text: "My use of social media has negatively affected my study time.",
  },
  {
    id: "AP2",
    construct: "AP",
    text: "I find it difficult to concentrate on academic work after a session on social media.",
  },
  {
    id: "AP3",
    construct: "AP",
    text: "I have missed, delayed, or rushed an assignment or deadline because of time spent on social media.",
  },
  {
    id: "AP4",
    construct: "AP",
    text: "Overall, I am satisfied with how I balance social media use and my academic responsibilities.",
    reverse: true,
  },
];

export const FACULTIES = [
  "Agriculture",
  "Arts",
  "Education",
  "Engineering",
  "Environmental Sciences",
  "Law",
  "Life Sciences",
  "Management Sciences",
  "Medical Sciences",
  "Pharmacy",
  "Physical Sciences",
  "Social Sciences",
  "Other",
];

export const LEVELS = ["100", "200", "300", "400", "500", "Postgraduate"];

export const GENDERS = ["Female", "Male", "Prefer not to say"];

export const AGE_BANDS = ["16-19", "20-23", "24-27", "28+"];

export const PLATFORMS = [
  "TikTok",
  "Instagram",
  "Facebook",
  "Twitter/X",
  "WhatsApp",
  "Other",
];

// CGPA bands on the standard Nigerian 5-point scale, mapped to a numeric
// midpoint used as the dependent variable in the regression analysis.
export const CGPA_BANDS: { band: string; value: number | null }[] = [
  { band: "First Class (4.50 - 5.00)", value: 4.75 },
  { band: "Second Class Upper (3.50 - 4.49)", value: 4.0 },
  { band: "Second Class Lower (2.40 - 3.49)", value: 2.95 },
  { band: "Third Class (1.50 - 2.39)", value: 1.95 },
  { band: "Pass (1.00 - 1.49)", value: 1.25 },
  { band: "Prefer not to say", value: null },
];

export function gpaValueForBand(band: string): number | null {
  return CGPA_BANDS.find((b) => b.band === band)?.value ?? null;
}
