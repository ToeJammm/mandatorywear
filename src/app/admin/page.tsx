import { isAdminAuthenticated } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await isAdminAuthenticated();
  if (!auth) redirect("/admin/login");

  const [settings, products, signups, orders] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "main" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.emailSignup.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } },
    }),
  ]);

  return <AdminDashboard settings={settings} products={products} signupCount={signups} orders={orders} />;
}
