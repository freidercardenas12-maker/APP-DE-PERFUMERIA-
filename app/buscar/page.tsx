import { SearchResults } from "@/components/SearchResults";
import { getProducts, getSettings } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca perfumes por cualquier letra en dama, caballero y árabe.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return <SearchResults products={products} initialQuery={q} whatsapp={settings.whatsapp} />;
}
