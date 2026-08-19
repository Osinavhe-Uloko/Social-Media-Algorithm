"use client";

const LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function LikertQuestion({
  id,
  text,
  index,
  total,
  value,
  onChange,
}: {
  id: string;
  text: string;
  index: number;
  total: number;
  value: number | undefined;
  onChange: (id: string, value: number) => void;
}) {
  return (
    <div className="py-4">
      <p className="text-sm font-medium text-slate-800">
        <span className="text-slate-400">
          {index + 1}/{total}
        </span>{" "}
        {text}
      </p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {LABELS.map((label, i) => {
          const v = i + 1;
          const selected = value === v;
          return (
            <button
              type="button"
              key={v}
              onClick={() => onChange(id, v)}
              className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors ${
                selected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              <div className="text-sm font-semibold">{v}</div>
              <div className="mt-0.5 hidden sm:block">{label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
