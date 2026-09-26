import { AdminPanel } from "@/components/AdminPanel";
import { getSession } from "@/lib/auth";
import { getProducts, getSettings } from "@/lib/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await getSession())) redirect("/admin/login");
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return <AdminPanel initialProducts={products} initialSettings={settings} />;
}
