import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  QUESTIONS,
  FACULTIES,
  LEVELS,
  GENDERS,
  AGE_BANDS,
  PLATFORMS,
  CGPA_BANDS,
} from "../src/lib/constructs";

const prisma = new PrismaClient();

// Deterministic PRNG (mulberry32) so the demo dataset is reproducible.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260819);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function clip(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// Approximate standard-normal noise via the Box-Muller transform.
function gaussianNoise(sd: number) {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * sd;
}

function nearestCgpaBand(gpaValue: number) {
  const bands = CGPA_BANDS.filter((b) => b.value !== null);
  let best = bands[0];
  let bestDiff = Infinity;
  for (const b of bands) {
    const diff = Math.abs((b.value as number) - gpaValue);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = b;
    }
  }
  return best;
}

function itemAnswersForScore(constructId: string, targetScore: number) {
  const items = QUESTIONS.filter((q) => q.construct === constructId);
  const answers: Record<string, number> = {};
  for (const item of items) {
    const raw = clip(Math.round(targetScore + gaussianNoise(0.5)), 1, 5);
    answers[item.id] = item.reverse ? 6 - raw : raw;
  }
  return answers;
}

const STUDENT_FIRST_NAMES = [
  "Chidinma", "Efe", "Osas", "Tega", "Aisha", "Emeka", "Blessing", "Kelechi",
  "Osamudiamen", "Faith", "Ifeoma", "Success", "Tobi", "Zainab", "Kesiena",
  "Uyi", "Precious", "Chukwuemeka", "Ngozi", "Ivie", "Endurance", "Damilola",
  "Omoruyi", "Chiamaka", "Gift", "Iyore", "Rita", "Samuel", "Confidence",
  "Godwin", "Mercy", "Ehis", "Angel", "Oghenekaro", "Amaka", "Divine",
  "Peace", "Vera", "Bright", "Miracle",
];
const STUDENT_LAST_NAMES = [
  "Okonkwo", "Idehen", "Igbinovia", "Eweka", "Osaretin", "Nwachukwu",
  "Omoregie", "Ojo", "Uwaifo", "Ehigiator", "Adeyemi", "Ogbeide", "Etsemudor",
  "Osayande", "Iyamu", "Alonge", "Erhabor", "Aigbovbioise", "Osagie", "Uwadia",
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@uniben.edu.ng" },
    update: {},
    create: {
      email: "admin@uniben.edu.ng",
      password: adminPassword,
      name: "Research Administrator",
      role: "ADMIN",
    },
  });
  console.log(`Admin ready: ${admin.email} / Admin123!`);

  const demoStudentPassword = await bcrypt.hash("Student123!", 10);
  const N = 45;

  for (let i = 0; i < N; i++) {
    const first = STUDENT_FIRST_NAMES[i % STUDENT_FIRST_NAMES.length];
    const last = pick(STUDENT_LAST_NAMES);
    const email = `demo.student${i + 1}@uniben.edu.ng`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const faculty = pick(FACULTIES.filter((f) => f !== "Other"));
    const level = pick(LEVELS.filter((l) => l !== "Postgraduate"));
    const gender = pick(GENDERS.filter((g) => g !== "Prefer not to say"));
    const ageBand = pick(AGE_BANDS);
    const primaryPlatform = pick(PLATFORMS.filter((p) => p !== "Other"));

    const student = await prisma.user.create({
      data: {
        name: `${first} ${last}`,
        email,
        password: demoStudentPassword,
        role: "STUDENT",
        faculty,
        level,
        gender,
        ageBand,
        primaryPlatform,
        matricNumber: `UNIBEN/${2019 + (i % 5)}/${(1000 + i).toString().padStart(4, "0")}`,
      },
    });

    // Underlying "true" algorithmic exposure propensity for this synthetic
    // student, used to correlate ACP/EMD/TSA with each other (they are not
    // independent in reality - a student pulled hard by one mechanism tends
    // to be pulled by the others too).
    const exposurePropensity = clip(2.6 + gaussianNoise(1.05), 1, 5);
    const acpScore = clip(exposurePropensity + gaussianNoise(0.4), 1, 5);
    const emdScore = clip(exposurePropensity + gaussianNoise(0.4), 1, 5);
    const tsaScore = clip(exposurePropensity + gaussianNoise(0.4), 1, 5);

    // Literacy is only weakly (negatively) related to exposure, and acts as
    // a moderator below rather than a driver of exposure itself.
    const alScore = clip(3.3 - 0.15 * exposurePropensity + gaussianNoise(0.9), 1, 5);

    const exposureIndex =
      Math.round(((acpScore + emdScore + tsaScore) / 3) * 100) / 100;

    // Academic impact rises with exposure and falls with literacy (the
    // moderation effect from the conceptual framework, Section 2.2.7).
    const academicImpactScore = clip(
      1.1 + 0.55 * exposureIndex - 0.28 * alScore + gaussianNoise(0.45),
      1,
      5
    );

    // GPA falls with exposure and rises with literacy, on the 1-5 scale
    // used for the CGPA band midpoints.
    const rawGpa = clip(
      4.6 - 0.42 * exposureIndex + 0.22 * alScore + gaussianNoise(0.55),
      1,
      5
    );
    const revealsGpa = rand() > 0.15; // ~15% choose "Prefer not to say"
    const cgpaBandEntry = revealsGpa ? nearestCgpaBand(rawGpa) : null;

    const answers: Record<string, number> = {
      ...itemAnswersForScore("ACP", acpScore),
      ...itemAnswersForScore("EMD", emdScore),
      ...itemAnswersForScore("TSA", tsaScore),
      ...itemAnswersForScore("AL", alScore),
      ...itemAnswersForScore("AP", academicImpactScore),
    };

    await prisma.response.create({
      data: {
        userId: student.id,
        answers: JSON.stringify(answers),
        acpScore: Math.round(acpScore * 100) / 100,
        emdScore: Math.round(emdScore * 100) / 100,
        tsaScore: Math.round(tsaScore * 100) / 100,
        alScore: Math.round(alScore * 100) / 100,
        exposureIndex,
        academicImpactScore: Math.round(academicImpactScore * 100) / 100,
        cgpaBand: cgpaBandEntry ? cgpaBandEntry.band : "Prefer not to say",
        gpaValue: cgpaBandEntry ? cgpaBandEntry.value : null,
        faculty,
        level,
        gender,
        ageBand,
        primaryPlatform,
      },
    });
  }

  console.log(`Seeded ${N} synthetic student responses.`);
  console.log(`Demo student login: demo.student1@uniben.edu.ng / Student123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
