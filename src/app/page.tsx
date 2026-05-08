import { prisma } from "@/lib/prisma";
import DropCountdown from "@/components/DropCountdown";
import ShopGrid from "@/components/ShopGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const dropActive = settings?.dropActive ?? false;

  if (dropActive) {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ isOneOfOne: "desc" }, { createdAt: "asc" }],
    });
    return <ShopGrid products={products} />;
  }

  return <DropCountdown dropDate={settings?.dropDate ?? null} />;
}
