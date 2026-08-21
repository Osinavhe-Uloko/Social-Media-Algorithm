import Link from "next/link";

const PILLARS = [
  {
    key: "ACP",
    title: "Content Personalisation",
    body: "How strongly your feed is tailored to your own past behaviour.",
  },
  {
    key: "EMD",
    title: "Engagement-Maximising Design",
    body: "How hard infinite scroll, autoplay, and notifications make it to stop.",
  },
  {
    key: "TSA",
    title: "Time on Algorithm-Curated Platforms",
    body: "How much study time is displaced by algorithm-curated apps.",
  },
  {
    key: "AL",
    title: "Algorithmic Literacy",
    body: "How well you understand — and can act on — the mechanisms above.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="text-sm font-semibold tracking-wide text-white/90">
          SMAIAS
        </div>
        <nav className="flex gap-3">
          <Link href="/login" className="btn-outline bg-transparent border-white/30 text-white hover:bg-white/10">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 text-center text-white">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-200">
          University of Benin &middot; Algorithmic Awareness Research
        </p>
        <h1 className="text-3xl font-bold sm:text-5xl">
          Social Media Algorithm Impact Assessment &amp; Awareness System
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
          Most research treats social media use as one blunt number: hours spent
          online. This tool looks instead at the algorithm itself &mdash; content
          personalisation, engagement-maximising design, time displacement, and
          your own awareness of these mechanisms &mdash; and how each relates to
          academic performance.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Take the self-assessment
          </Link>
          <Link href="/login" className="btn-outline bg-transparent border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.key} className="card p-5">
              <div className="badge bg-brand-50 text-brand-700">{p.key}</div>
              <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-6">
          <h2 className="font-semibold text-slate-900">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Create a student account and complete a short, self-reported assessment (five-point scale).</li>
            <li>Instantly receive individual construct scores, plain-language interpretation, and a literacy-moderation note.</li>
            <li>Aggregate, de-identified results feed an administrator/researcher dashboard with descriptive statistics, a correlation matrix, and a live multiple-regression analysis.</li>
          </ol>
          <p className="mt-4 text-xs text-slate-400">
            This system is self-reported only. It has no access to, and makes no
            claim about, the internal ranking logic of any social media platform.
          </p>
        </div>
      </section>
    </main>
  );
}
