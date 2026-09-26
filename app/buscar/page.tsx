import { SearchResults } from "@/components/SearchResults";
import { getProducts } from "@/lib/store";
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
  const products = await getProducts();
  return <SearchResults products={products} initialQuery={q} />;
}
