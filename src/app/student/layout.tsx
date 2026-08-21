import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        name={user.name}
        roleLabel="Student"
        links={[
          { href: "/student", label: "Dashboard" },
          { href: "/student/assessment", label: "Take Assessment" },
          { href: "/student/history", label: "History" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
