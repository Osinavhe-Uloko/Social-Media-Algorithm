import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        name={user.name}
        roleLabel="Administrator / Researcher"
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/responses", label: "Responses" },
          { href: "/admin/analysis", label: "Analysis" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
