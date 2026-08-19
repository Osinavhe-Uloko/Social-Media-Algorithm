"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS: Record<string, string> = {
  Low: "#94a3b8",
  Moderate: "#3b63f5",
  High: "#dc2626",
};

export default function ScoreBars({
  data,
}: {
  data: { construct: string; score: number; band: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
        <XAxis dataKey="construct" tick={{ fontSize: 12, fill: "#475569" }} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip
          formatter={(value: number, _name, item) => [
            value,
            `Score (${item.payload.band})`,
          ]}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={COLORS[d.band] ?? "#3b63f5"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
