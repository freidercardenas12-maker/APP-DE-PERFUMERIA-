import { ProductGrid } from "@/components/ProductGrid";
import { CATEGORY_META } from "@/lib/categories";
import { getProducts, getSettings } from "@/lib/store";
import { CATEGORIAS } from "@/lib/types";
import Link from "next/link";

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const destacados = CATEGORIAS.flatMap((categoria) =>
    products.filter((product) => product.categoria === categoria && product.destacado && product.disponible).slice(0, 4),
  );
  const counts = Object.fromEntries(CATEGORIAS.map((categoria) => [categoria, products.filter((product) => product.categoria === categoria).length]));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[rgba(212,175,55,0.2)]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div className="order-2 md:order-1">
            <p className="inline-block max-w-full border-2 border-[#d4af37] px-4 py-3 font-serif text-3xl leading-tight tracking-[0.04em] text-[#f3e0a8] uppercase md:px-6 md:py-4 md:text-5xl">
              Precios mayoristas y al detal
            </p>
            <p className="mt-3 text-sm tracking-[0.22em] text-[#d4af37] uppercase">Los mejores precios · Calidad 1.1</p>
            {settings.promoActiva ? (
              <p className="mt-6 inline-block border border-[#d4af37] px-3 py-1 text-xs tracking-[0.22em] text-[#e8d5a3] uppercase">
                {settings.promoTexto}
              </p>
            ) : null}
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.95] text-[#f6f1e7] md:text-7xl">
              Elige, arma el pedido y envíalo por WhatsApp.
            </h1>
            {settings.promoSubtitulo ? (
              <p className="mt-4 max-w-lg font-serif text-2xl leading-snug text-[#e8d5a3]">{settings.promoSubtitulo}</p>
            ) : null}
            <p className="mt-6 max-w-lg text-base leading-7 text-[#f6f1e7]/75">
              Al por mayor y al detal, con los mejores precios. Dama, caballero y árabe / nicho. Busca por nombre, a qué huele o para qué ocasión, suma cantidades y el total sale listo en el mensaje.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogo/dama" className="btn-gold">
                Ver catálogo dama
              </Link>
              <Link href="/catalogo/caballero" className="btn-ghost">
                Caballero
              </Link>
              <Link href="/catalogo/arabe" className="btn-ghost">
                Árabe / nicho
              </Link>
            </div>
          </div>
          <div className="order-1 grid place-items-center md:order-2">
            <img src="/logo.jpg" alt="Aura & Essentia" className="h-auto w-full max-w-xs md:max-w-sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {CATEGORIAS.map((categoria) => {
          const meta = CATEGORY_META[categoria];
          return (
            <Link key={categoria} href={`/catalogo/${categoria}`} data-cat={categoria} className="card-lift block p-6">
              <p className="text-xs tracking-[0.2em] text-[var(--accent)] uppercase">{meta.kicker}</p>
              <h2 className="mt-3 font-serif text-4xl">{meta.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[#f6f1e7]/70">{meta.description}</p>
              <p className="mt-6 text-sm text-[#e8d5a3]">{counts[categoria]} referencias</p>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl">Destacados de la semana</h2>
        </div>
        <ProductGrid products={destacados} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {[
          ["01", "Elige", "Busca por nombre, a qué huele o para qué ocasión: cita, regalo, día o noche."],
          ["02", "Arma", "Suma cantidades. Desde 3 unidades baja el precio de ese perfume, y desde 6 queda mejor."],
          ["03", "Envía", "Tus datos y la lista salen listos en un mensaje de WhatsApp."],
        ].map(([step, title, text]) => (
          <article key={step} className="border border-[rgba(212,175,55,0.18)] p-6">
            <p className="text-xs tracking-[0.2em] text-[#d4af37]">{step}</p>
            <h3 className="mt-3 font-serif text-3xl">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#f6f1e7]/70">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
