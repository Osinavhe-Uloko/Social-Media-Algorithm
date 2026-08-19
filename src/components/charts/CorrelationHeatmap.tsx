"use client";

function colorFor(value: number) {
  if (isNaN(value)) return "#f1f5f9";
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    const alpha = 0.12 + clamped * 0.75;
    return `rgba(37, 69, 232, ${alpha})`;
  }
  const alpha = 0.12 + Math.abs(clamped) * 0.75;
  return `rgba(220, 38, 38, ${alpha})`;
}

export default function CorrelationHeatmap({
  vars,
  matrix,
}: {
  vars: string[];
  matrix: Record<string, Record<string, number>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2" />
            {vars.map((v) => (
              <th key={v} className="p-2 text-center font-medium text-slate-500">
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vars.map((row) => (
            <tr key={row}>
              <th className="whitespace-nowrap p-2 text-right font-medium text-slate-500">
                {row}
              </th>
              {vars.map((col) => {
                const value = matrix[row]?.[col] ?? NaN;
                return (
                  <td
                    key={col}
                    className="h-14 w-16 text-center align-middle font-medium"
                    style={{ backgroundColor: colorFor(value) }}
                  >
                    <span className={Math.abs(value) > 0.5 ? "text-white" : "text-slate-700"}>
                      {isNaN(value) ? "—" : value.toFixed(2)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
