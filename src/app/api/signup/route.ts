import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  phone: z.string().min(7).max(20),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const phone = parsed.data.phone.replace(/\D/g, "");

  try {
    await prisma.phoneSignup.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Already signed up." }, { status: 409 });
  }
}
