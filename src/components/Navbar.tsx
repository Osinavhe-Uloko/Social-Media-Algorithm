"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export interface NavLink {
  href: string;
  label: string;
}

export default function Navbar({
  name,
  roleLabel,
  links,
}: {
  name: string;
  roleLabel: string;
  links: NavLink[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-brand-600">
            SMAIAS
          </Link>
          <nav className="flex gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-800">{name}</div>
            <div className="text-xs text-slate-400">{roleLabel}</div>
          </div>
          <button onClick={handleLogout} className="btn-outline px-3 py-1.5 text-xs">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
