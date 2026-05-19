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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;
    const productId = session.metadata?.productId;
    const quantity = parseInt(session.metadata?.quantity ?? "1", 10);

    if (!productId) return NextResponse.json({ ok: true });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ ok: true });

    // shipping_details for card, customer_details.address for Apple Pay
    const shipping = session.shipping_details;
    const address = shipping?.address ?? session.customer_details?.address;
    const name = shipping?.name ?? session.customer_details?.name ?? "";

    await prisma.$transaction([
      prisma.order.create({
        data: {
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email ?? "",
          customerName: session.customer_details?.name ?? "",
          productId,
          quantity,
          total: session.amount_total ?? 0,
          status: "paid",
          shippingName: name,
          shippingLine1: address?.line1 ?? "",
          shippingLine2: address?.line2 ?? "",
          shippingCity: address?.city ?? "",
          shippingState: address?.state ?? "",
          shippingZip: address?.postal_code ?? "",
          shippingCountry: address?.country ?? "",
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
