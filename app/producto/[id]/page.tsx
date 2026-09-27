import { ProductDetail } from "@/components/ProductDetail";
import { perfilAroma } from "@/lib/aroma";
import { formatCOP, formatTalla, precioVigente } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/store";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Context = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Producto" };
  return {
    title: product.nombre,
    description: `${product.nombre}. ${perfilAroma(product).frase} ${formatTalla(product.talla_ml)}, precio mayorista y al detal ${formatCOP(precioVigente(product))}.`,
  };
}

export default async function ProductPage({ params }: Context) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const same = (await getProducts()).filter((item) => item.categoria === product.categoria && item.id !== product.id);
  const withSharedNotes = same.filter((item) => item.notas.some((note) => product.notas.includes(note)));
  const related = (withSharedNotes.length >= 4 ? withSharedNotes : same).slice(0, 4);
  return <ProductDetail product={product} related={related} />;
}
