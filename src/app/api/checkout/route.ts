import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId, active: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (product.sold) {
    return NextResponse.json({ error: "Sold out." }, { status: 409 });
  }
  if (!product.isOneOfOne && product.quantity < quantity) {
    return NextResponse.json({ error: "Not enough stock." }, { status: 409 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["US"] },
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images.slice(0, 1),
          },
        },
      },
    ],
    metadata: {
      productId: product.id,
      quantity: String(quantity),
    },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/product/${product.id}`,
  });

  return NextResponse.json({ url: session.url });
}
