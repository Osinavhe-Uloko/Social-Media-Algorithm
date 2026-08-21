import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = 25;

  // Respondents with a real email (registered through the app, or imported
  // from the CSV with a genuine address) are surfaced before anonymous
  // "@survey.local" placeholder accounts created for unattributed CSV rows.
  const all = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, matricNumber: true } } },
  });

  const respondentNumber = (email: string) => {
    const match = email.match(/^respondent(\d+)@survey\.local$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const sorted = all.sort((a, b) => {
    const aNum = respondentNumber(a.user.email);
    const bNum = respondentNumber(b.user.email);
    const aPlaceholder = aNum !== null;
    const bPlaceholder = bNum !== null;
    if (aPlaceholder !== bPlaceholder) return aPlaceholder ? 1 : -1;
    // Placeholder accounts: ascending by respondent number, continuing
    // straight on from wherever the real-email respondents left off.
    if (aPlaceholder && bPlaceholder) return (aNum as number) - (bNum as number);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = sorted.length;
  const responses = sorted.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    responses,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
