"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FACULTIES, LEVELS, GENDERS, AGE_BANDS, PLATFORMS } from "@/lib/constructs";

const initial = {
  name: "",
  email: "",
  password: "",
  matricNumber: "",
  faculty: "",
  level: "",
  gender: "",
  ageBand: "",
  primaryPlatform: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      router.push("/student");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-semibold text-brand-600">
            SMAIAS
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            Create your student account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Demographic fields are optional but power the aggregate breakdowns
            researchers see on the admin dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full name</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Matric number (optional)</label>
              <input
                className="input"
                value={form.matricNumber}
                onChange={(e) => update("matricNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Faculty</label>
              <select
                className="input"
                value={form.faculty}
                onChange={(e) => update("faculty", e.target.value)}
              >
                <option value="">Select...</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select
                className="input"
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
              >
                <option value="">Select...</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Select...</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Age band</label>
              <select
                className="input"
                value={form.ageBand}
                onChange={(e) => update("ageBand", e.target.value)}
              >
                <option value="">Select...</option>
                {AGE_BANDS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Primary platform</label>
              <select
                className="input"
                value={form.primaryPlatform}
                onChange={(e) => update("primaryPlatform", e.target.value)}
              >
                <option value="">Select...</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
