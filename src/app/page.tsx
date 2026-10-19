import { prisma } from "@/lib/prisma";
import DropCountdown from "@/components/DropCountdown";
import ShopGrid from "@/components/ShopGrid";

export const dynamic = "force-dynamic";

function hasPassed(date: Date | null | undefined) {
  return !!date && date.getTime() <= Date.now();
}

export default async function Home() {
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const dropActive = (settings?.dropActive ?? false) || hasPassed(settings?.dropDate);

  if (dropActive) {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ isOneOfOne: "desc" }, { createdAt: "asc" }],
    });
    return <ShopGrid products={products} />;
  }

  return <DropCountdown dropDate={settings?.dropDate ?? null} />;
}
