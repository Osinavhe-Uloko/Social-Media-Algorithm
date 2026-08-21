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

// This is the exact 13-item instrument administered in the field survey
// ("The influence of Social Media Algorithms on Academic Performance").
// Question numbering below matches the numbering used on the instrument.
export const QUESTIONS: LikertQuestion[] = [
  // Algorithm Influenced Content Personalisation
  {
    id: "ACP1",
    construct: "ACP",
    text: "The app keeps track of small things I do — how long I watch a video, what I pause on, or what I skip — and uses that to decide what to show me next.",
  },
  {
    id: "ACP2",
    construct: "ACP",
    text: "Over time, the app seems to build a clear picture of exactly what I like, sometimes noticing patterns in my behaviour before I notice them myself.",
  },
  {
    id: "ACP3",
    construct: "ACP",
    text: "The content I see feels specifically chosen for me based on my history on the app, rather than just being posts from people I follow in the order they were made.",
  },

  // Engagement-Maximising Design Features
  {
    id: "EMD1",
    construct: "EMD",
    text: "As soon as one video ends, the next one starts playing automatically, so I never get a natural pause to decide whether to keep watching or stop.",
  },
  {
    id: "EMD2",
    construct: "EMD",
    text: "The feed has no clear end — there's always another post waiting, which makes it harder for me to find a natural point to stop scrolling.",
  },
  {
    id: "EMD3",
    construct: "EMD",
    text: "Notifications often appear at moments that seem timed to pull me back in, especially after I haven't opened the app in a while.",
  },

  // System Interference with Study Time
  {
    id: "TSA1",
    construct: "TSA",
    text: "Because the app keeps showing me things it seems to know I'll find hard to ignore, a short break during study time often turns into a much longer one than I planned.",
  },
  {
    id: "TSA2",
    construct: "TSA",
    text: "I find it harder to stop using apps that personalise what I see, like TikTok or Instagram, than apps that just show messages in the order they arrive, like WhatsApp..",
  },
  {
    id: "TSA3",
    construct: "TSA",
    text: "Even after I stop scrolling, I sometimes keep thinking about what I saw, which makes it harder to fully concentrate on studying afterward..",
  },

  // Algorithmic Awareness and Resistance (moderator)
  {
    id: "AL1",
    construct: "AL",
    text: "I recognise when an app is using autoplay, endless scrolling, or notifications specifically to keep me engaged longer than I intended.",
  },
  {
    id: "AL2",
    construct: "AL",
    text: "Once I started noticing these design tricks, I began taking active steps to reduce their effect on me, like using screen time limits or app timers.",
  },
  {
    id: "AL3",
    construct: "AL",
    text: "If I understood more about exactly how these apps track and use my activity, I would probably change how I use them.",
  },

  // Academic Performance / Impact (dependent variable, Likert component)
  {
    id: "AP1",
    construct: "AP",
    text: "Overall, I believe how these apps are specifically designed and personalised affects my academic performance more than my own habits or self-discipline.",
  },
];

export const FACULTIES = [
  "Agricultural Science",
  "Computing",
  "Education",
  "Engineering",
  "Environmental Science",
  "Law",
  "Life Science",
  "Management Science",
  "Physical Science",
  "Social Science",
  "Other",
];

export const LEVELS = ["100", "200", "300", "400", "500"];

export const GENDERS = ["Female", "Male", "Prefer not to say"];

export const AGE_BANDS = ["16-20", "21-25", "26-30", "31+"];

export const PLATFORMS = [
  "Instagram",
  "Tiktok",
  "Facebook",
  "Twitter(X)",
  "WhatsApp",
  "Snapchat",
  "LinkedIn",
  "Pinterest",
  "Other",
];

// CGPA bands, matching the ranges used on the field survey instrument,
// mapped to a numeric midpoint used as the dependent variable in the
// regression analysis.
export const CGPA_BANDS: { band: string; value: number | null }[] = [
  { band: "4.5-5.0", value: 4.75 },
  { band: "3.5-4.49", value: 3.995 },
  { band: "3.0-3.49", value: 3.245 },
  { band: "2.0-2.99", value: 2.495 },
  { band: "Below 2.0", value: 1.5 },
  { band: "Prefer not to say", value: null },
];

export function gpaValueForBand(band: string): number | null {
  return CGPA_BANDS.find((b) => b.band === band)?.value ?? null;
}
