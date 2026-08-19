"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LikertQuestion from "@/components/LikertQuestion";

interface Question {
  id: string;
  construct: "ACP" | "EMD" | "TSA" | "AL" | "AP";
  text: string;
}

interface ConstructMetaEntry {
  name: string;
  short: string;
  description: string;
  kind: string;
}

const SECTION_ORDER: Question["construct"][] = ["ACP", "EMD", "TSA", "AL", "AP"];

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [constructs, setConstructs] = useState<Record<string, ConstructMetaEntry>>({});
  const [cgpaBands, setCgpaBands] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [cgpaBand, setCgpaBand] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assessment/questions")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setConstructs(data.constructs);
        setCgpaBands(data.cgpaBands);
        setLoading(false);
      });
  }, []);

  const sections = useMemo(() => {
    return SECTION_ORDER.map((key) => ({
      key,
      questions: questions.filter((q) => q.construct === key),
    })).filter((s) => s.questions.length > 0);
  }, [questions]);

  const totalSteps = sections.length + 1; // +1 for CGPA / summary step
  const currentSection = step < sections.length ? sections[step] : null;

  function setAnswer(id: string, value: number) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function sectionComplete(section: { questions: Question[] }) {
    return section.questions.every((q) => typeof answers[q.id] === "number");
  }

  function handleNext() {
    if (currentSection && !sectionComplete(currentSection)) {
      setError("Please answer every question before continuing.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (questions.some((q) => typeof answers[q.id] !== "number")) {
      setError("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, cgpaBand: cgpaBand || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }
      router.push("/student");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading assessment...</div>;
  }

  const progress = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Step {step + 1} of {totalSteps}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentSection ? (
        <div className="card p-6">
          <span className="badge bg-brand-50 text-brand-700">
            {currentSection.key}
          </span>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {constructs[currentSection.key]?.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {constructs[currentSection.key]?.description}
          </p>
          <div className="mt-2 divide-y divide-slate-100">
            {currentSection.questions.map((q, i) => (
              <LikertQuestion
                key={q.id}
                id={q.id}
                text={q.text}
                index={i}
                total={currentSection.questions.length}
                value={answers[q.id]}
                onChange={setAnswer}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="btn-secondary"
            >
              Back
            </button>
            <button type="button" onClick={handleNext} className="btn-primary">
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            One last thing (optional)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your self-reported CGPA band lets the researcher dashboard relate
            these scores to academic performance. You can skip this.
          </p>
          <div className="mt-4">
            <label className="label">CGPA band</label>
            <select
              className="input"
              value={cgpaBand}
              onChange={(e) => setCgpaBand(e.target.value)}
            >
              <option value="">Prefer not to answer</option>
              {cgpaBands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-between">
            <button type="button" onClick={handleBack} className="btn-secondary">
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? "Submitting..." : "Submit assessment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
