import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { FACULTIES, PLATFORMS, CGPA_BANDS } from "../src/lib/constructs";
import { scoreAssessment } from "../src/lib/scoring";

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, "data", "survey-responses.csv");

// Column order in prisma/data/survey-responses.csv. The instrument text for
// each question lives in src/lib/constructs.ts (QUESTIONS) - this is just
// the column -> question id mapping used to read the raw CSV.
const QUESTION_COLUMNS = [
  "ACP1", "ACP2", "ACP3",
  "EMD1", "EMD2", "EMD3",
  "TSA1", "TSA2", "TSA3",
  "AL1", "AL2", "AL3",
  "AP1",
] as const;

const LIKERT_VALUES: Record<string, number> = {
  "Strongly Disagree": 1,
  "Disagree": 2,
  "Neutral": 3,
  "Agree": 4,
  "Strongly Agree": 5,
};

interface SurveyRow {
  username: string;
  gender: string;
  age: string;
  level: string;
  faculty: string;
  platforms: string;
  cgpaRange: string;
  answers: Record<string, number>;
}

function parseCsv(text: string): SurveyRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const [, ...dataLines] = lines; // skip header

  return dataLines.map((line) => {
    const cols = line.split(",");
    const answers: Record<string, number> = {};
    QUESTION_COLUMNS.forEach((qId, i) => {
      const label = cols[8 + i]?.trim();
      answers[qId] = LIKERT_VALUES[label];
    });
    return {
      username: cols[0]?.trim() ?? "",
      gender: cols[1]?.trim() ?? "",
      age: cols[2]?.trim() ?? "",
      level: cols[3]?.trim() ?? "",
      faculty: cols[4]?.trim() ?? "",
      platforms: cols[6]?.trim() ?? "",
      cgpaRange: cols[7]?.trim() ?? "",
      answers,
    };
  });
}

// Maps loose survey-instrument spellings onto the app's canonical FACULTIES.
const FACULTY_ALIASES: Record<string, string> = {
  "physical science": "Physical Science",
  "management science": "Management Science",
  "life science": "Life Science",
  "social science": "Social Science",
  "environmental science": "Environmental Science",
  "agricultural science": "Agricultural Science",
  "computing": "Computing",
  "law": "Law",
  "education": "Education",
  "engineering": "Engineering",
};

function normaliseFaculty(raw: string): string {
  const match = FACULTY_ALIASES[raw.trim().toLowerCase()];
  if (match && FACULTIES.includes(match)) return match;
  return "Other";
}

function normaliseLevel(raw: string): string {
  return raw.trim().replace(/lvl$/i, "");
}

function normalisePlatform(raw: string): string {
  const first = raw.split(";")[0]?.trim().toLowerCase() ?? "";
  const match = PLATFORMS.find((p) => p.toLowerCase() === first);
  return match ?? "Other";
}

function normaliseCgpaBand(raw: string): string | null {
  const trimmed = raw.trim();
  const match = CGPA_BANDS.find((b) => b.band === trimmed);
  return match ? match.band : null;
}

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

  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsv(csvText);

  // Shared placeholder password for imported survey respondents. These
  // accounts exist so each real response has a User row to attach to; the
  // respondents never registered through the app, so this password isn't
  // meant to be used for login.
  const importedPassword = await bcrypt.hash("ImportedRespondent123!", 10);

  let created = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.username || `respondent${i + 1}@survey.local`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const name = row.username
      ? row.username.split("@")[0]
      : `Survey Respondent ${i + 1}`;

    const faculty = normaliseFaculty(row.faculty);
    const level = normaliseLevel(row.level);
    const gender = row.gender.trim();
    const ageBand = row.age.trim();
    const primaryPlatform = normalisePlatform(row.platforms);
    const cgpaBand = normaliseCgpaBand(row.cgpaRange);

    if (Object.values(row.answers).some((v) => typeof v !== "number")) {
      console.warn(`Skipping row ${i + 1}: unrecognised Likert value.`);
      continue;
    }

    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: importedPassword,
        role: "STUDENT",
        faculty,
        level,
        gender,
        ageBand,
        primaryPlatform,
      },
    });

    const scored = scoreAssessment(row.answers, cgpaBand);

    await prisma.response.create({
      data: {
        userId: student.id,
        answers: JSON.stringify(row.answers),
        acpScore: scored.acpScore,
        emdScore: scored.emdScore,
        tsaScore: scored.tsaScore,
        alScore: scored.alScore,
        exposureIndex: scored.exposureIndex,
        academicImpactScore: scored.academicImpactScore,
        cgpaBand: cgpaBand ?? "Prefer not to say",
        gpaValue: scored.gpaValue,
        faculty,
        level,
        gender,
        ageBand,
        primaryPlatform,
      },
    });

    created++;
  }

  console.log(`Imported ${created} real survey responses from ${CSV_PATH}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
