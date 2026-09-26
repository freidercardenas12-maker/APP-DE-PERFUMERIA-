import { CATEGORIAS } from "@/lib/types";
import { getProducts } from "@/lib/store";
import type { MetadataRoute } from "next";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  const now = new Date();
  return [
    { url: base, lastModified: now },
    { url: `${base}/contacto`, lastModified: now },
    { url: `${base}/carrito`, lastModified: now },
    ...CATEGORIAS.map((categoria) => ({ url: `${base}/catalogo/${categoria}`, lastModified: now })),
    ...products.map((product) => ({
      url: `${base}/producto/${product.id}`,
      lastModified: product.updated_at,
    })),
  ];
}
