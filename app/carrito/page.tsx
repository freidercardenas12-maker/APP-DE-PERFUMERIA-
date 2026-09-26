import { CartView } from "@/components/CartView";
import { getProducts, getSettings } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu pedido",
  description: "Arma tu pedido de perfumes al por mayor y al detal, y envíalo por WhatsApp.",
};

export default async function CartPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return <CartView products={products} settings={settings} />;
}
