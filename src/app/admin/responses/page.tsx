"use client";

import { useEffect, useState } from "react";

interface ResponseRow {
  id: string;
  createdAt: string;
  faculty: string | null;
  level: string | null;
  primaryPlatform: string | null;
  acpScore: number;
  emdScore: number;
  tsaScore: number;
  alScore: number;
  exposureIndex: number;
  academicImpactScore: number;
  cgpaBand: string | null;
  user: { name: string; email: string; matricNumber: string | null };
}

export default function AdminResponsesPage() {
  const [data, setData] = useState<{
    responses: ResponseRow[];
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/responses?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Responses</h1>
          <p className="text-sm text-slate-500">
            {data ? `${data.total} total submissions` : "Loading..."}
          </p>
        </div>
        <a href="/api/admin/export" className="btn-secondary">
          Export CSV
        </a>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Faculty / Level</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">ACP</th>
              <th className="px-4 py-3">EMD</th>
              <th className="px-4 py-3">TSA</th>
              <th className="px-4 py-3">AL</th>
              <th className="px-4 py-3">Exposure</th>
              <th className="px-4 py-3">CGPA band</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && data?.responses.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-400">
                  No responses yet.
                </td>
              </tr>
            )}
            {data?.responses.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{r.user.name}</div>
                  <div className="text-xs text-slate-400">{r.user.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.faculty ?? "—"} {r.level ? `/ ${r.level}` : ""}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.primaryPlatform ?? "—"}</td>
                <td className="px-4 py-3">{r.acpScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.emdScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.tsaScore.toFixed(2)}</td>
                <td className="px-4 py-3">{r.alScore.toFixed(2)}</td>
                <td className="px-4 py-3 font-medium">{r.exposureIndex.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">{r.cgpaBand ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn-outline px-3 py-1.5 text-xs"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            className="btn-outline px-3 py-1.5 text-xs"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
