import { CatalogView } from "@/components/CatalogView";
import { CATEGORY_META } from "@/lib/categories";
import { getProducts } from "@/lib/store";
import { isCategoria } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Context = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategoria(categoria)) return { title: "Catálogo" };
  const meta = CATEGORY_META[categoria];
  return { title: meta.seoTitle, description: meta.seoDescription };
}

export default async function CatalogPage({ params }: Context) {
  const { categoria } = await params;
  if (!isCategoria(categoria)) notFound();
  const products = (await getProducts()).filter((product) => product.categoria === categoria);
  return <CatalogView categoria={categoria} products={products} />;
}
