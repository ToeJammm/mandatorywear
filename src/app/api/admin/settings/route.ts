import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  dropDate: z.string().nullable().optional(),
  dropActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  return NextResponse.json(settings ?? {});
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.dropActive !== undefined) data.dropActive = parsed.data.dropActive;
  if ("dropDate" in parsed.data) {
    data.dropDate = parsed.data.dropDate ? new Date(parsed.data.dropDate) : null;
  }

  const settings = await prisma.settings.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
