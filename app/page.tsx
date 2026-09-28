import { PedidoSeis } from "@/components/PedidoSeis";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts, getSettings } from "@/lib/store";
import { CATEGORIAS, type Producto } from "@/lib/types";
import Link from "next/link";

function seisListos(products: Producto[]) {
  return CATEGORIAS.flatMap((categoria) => {
    const linea = products.filter((product) => product.categoria === categoria && product.disponible && product.talla_ml != null);
    const destacadosLinea = linea.filter((product) => product.destacado);
    return (destacadosLinea.length >= 2 ? destacadosLinea : linea).slice(0, 2);
  });
}

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const destacados = CATEGORIAS.flatMap((categoria) =>
    products.filter((product) => product.categoria === categoria && product.destacado && product.disponible).slice(0, 4),
  );
  const pedidoSeis = seisListos(products);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[rgba(212,175,55,0.2)]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div className="order-2 md:order-1">
            <h1 className="max-w-xl font-serif text-5xl leading-[0.95] text-[#f6f1e7] md:text-6xl">Toque el perfume que quiere.</h1>
            <p className="mt-4 max-w-lg text-xl leading-8 text-[#f6f1e7]/80">Se abre WhatsApp con el pedido escrito. Usted solo lo envía.</p>
            {settings.promoSubtitulo ? <p className="mt-3 max-w-lg text-lg text-[#e8d5a3]">{settings.promoSubtitulo}</p> : null}
            <div className="mt-8 grid max-w-md gap-3">
              <Link href="/catalogo/dama" className="btn-facil">
                Para ella
              </Link>
              <Link href="/catalogo/caballero" className="btn-facil">
                Para él
              </Link>
              <Link href="/catalogo/arabe" className="btn-facil">
                Árabes
              </Link>
              {settings.instagram ? (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn-ghost">
                  Instagram
                </a>
              ) : null}
            </div>
          </div>
          <div className="order-1 grid place-items-center md:order-2">
            <img src="/logo.jpg" alt="Aura & Essentia" className="h-auto w-full max-w-xs md:max-w-sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 font-serif text-4xl">Estos gustan mucho</h2>
        <ProductGrid products={destacados} whatsapp={settings.whatsapp} />
      </section>

      <PedidoSeis products={pedidoSeis} />
    </div>
  );
}
