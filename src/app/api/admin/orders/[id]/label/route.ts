import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getShippo } from "@/lib/shippo";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.shippingLine1) return NextResponse.json({ error: "No shipping address on this order" }, { status: 400 });

  const shippo = getShippo();

  const shipment = await shippo.shipments.create({
    addressFrom: {
      name: process.env.SHIP_FROM_NAME!,
      street1: process.env.SHIP_FROM_ADDRESS!,
      city: process.env.SHIP_FROM_CITY!,
      state: process.env.SHIP_FROM_STATE!,
      zip: process.env.SHIP_FROM_ZIP!,
      country: "US",
    },
    addressTo: {
      name: order.shippingName ?? order.customerName ?? "",
      street1: order.shippingLine1,
      street2: order.shippingLine2 ?? "",
      city: order.shippingCity ?? "",
      state: order.shippingState ?? "",
      zip: order.shippingZip ?? "",
      country: order.shippingCountry ?? "US",
    },
    parcels: [
      {
        length: "12",
        width: "9",
        height: "2",
        distanceUnit: "in",
        weight: "1",
        massUnit: "lb",
      },
    ],
    async: false,
  });

  // Pick the cheapest USPS rate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rates: any[] = shipment.rates ?? [];
  const rate = rates
    .filter((r) => r.provider === "USPS")
    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0] ?? rates[0];

  if (!rate) return NextResponse.json({ error: "No rates available" }, { status: 400 });

  const transaction = await shippo.transactions.create({
    rate: rate.objectId,
    labelFileType: "PDF",
    async: false,
  });

  if (transaction.status !== "SUCCESS") {
    return NextResponse.json({ error: transaction.messages?.[0]?.text ?? "Label generation failed" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: {
      labelUrl: transaction.labelUrl,
      trackingNumber: transaction.trackingNumber,
      status: "label_created",
    },
  });

  return NextResponse.json({
    labelUrl: transaction.labelUrl,
    trackingNumber: transaction.trackingNumber,
  });
}
