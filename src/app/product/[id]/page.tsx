import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, active: true } });
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
