import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId;
    const quantity = parseInt(session.metadata?.quantity ?? "1", 10);

    if (!productId) return NextResponse.json({ ok: true });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ ok: true });

    await prisma.$transaction([
      prisma.order.create({
        data: {
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email ?? "",
          productId,
          quantity,
          total: session.amount_total ?? 0,
          status: "paid",
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: product.isOneOfOne
          ? { sold: true }
          : { quantity: { decrement: quantity }, sold: product.quantity - quantity <= 0 },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
