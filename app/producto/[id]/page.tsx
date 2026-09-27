import { ProductDetail } from "@/components/ProductDetail";
import { perfilAroma } from "@/lib/aroma";
import { formatCOP, formatTalla, precioUnitario } from "@/lib/format";
import { getProduct, getProducts, getSettings } from "@/lib/store";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Context = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Producto" };
  return {
    title: product.nombre,
    description: `${product.nombre}. ${perfilAroma(product).frase} ${formatTalla(product.talla_ml)}. Precio por unidad ${formatCOP(precioUnitario(product, 1))}. Desde 12 unidades, ${formatCOP(precioUnitario(product, 12))} cada una.`,
    openGraph: {
      title: product.nombre,
      description: perfilAroma(product).frase,
      images: product.imagen_url ? [product.imagen_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Context) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const same = (await getProducts()).filter((item) => item.categoria === product.categoria && item.id !== product.id);
  const withSharedNotes = same.filter((item) => item.notas.some((note) => product.notas.includes(note)));
  const related = (withSharedNotes.length >= 4 ? withSharedNotes : same).slice(0, 4);
  const settings = await getSettings();
  return (
    <ProductDetail
      product={product}
      related={related}
      whatsapp={settings.whatsapp}
      pago={settings.pago}
      entrega={settings.entrega}
    />
  );
}
