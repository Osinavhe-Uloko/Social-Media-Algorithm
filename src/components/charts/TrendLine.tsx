"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const SERIES = [
  { key: "acpScore", label: "ACP", color: "#3b63f5" },
  { key: "emdScore", label: "EMD", color: "#dc2626" },
  { key: "tsaScore", label: "TSA", color: "#059669" },
  { key: "alScore", label: "AL", color: "#d97706" },
];

export default function TrendLine({
  data,
}: {
  data: { label: string; acpScore: number; emdScore: number; tsaScore: number; alScore: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
