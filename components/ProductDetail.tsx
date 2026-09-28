"use client";

import { perfilAroma } from "@/lib/aroma";
import { Bottle } from "@/components/Bottle";
import { ProductGrid } from "@/components/ProductGrid";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { ShareButton } from "@/components/ShareButton";
import { CANTIDADES_MAYOR, formatCOP, formatTalla, gananciaReventa, precioUnitario, tienePromo, waLink } from "@/lib/format";
import { mensajeCompra } from "@/lib/order";
import type { Producto } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductDetail({
  product,
  related,
  whatsapp,
  pago,
  entrega,
}: {
  product: Producto;
  related: Producto[];
  whatsapp: string;
  pago: string;
  entrega: string;
}) {
  const { add, lines, count } = useCart();
  const router = useRouter();
  const enPedido = lines.find((line) => line.id === product.id)?.cantidad ?? 0;
  const [cantidad, setCantidad] = useState(1);
  const detalle = precioUnitario(product, 1);
  const unitario = precioUnitario(product, cantidad);
  const reventa = gananciaReventa(product);
  const promo = tienePromo(product);
  const baja = unitario < detalle;

  function comprarPorWhatsapp() {
    if (!product.disponible || !whatsapp) return;
    const text = mensajeCompra({
      nombre: product.nombre,
      linea: meta.label,
      talla: formatTalla(product.talla_ml),
      aroma: perfilAroma(product).frase,
      cantidad,
      unitario,
      url: window.location.href,
    });
    window.open(waLink(whatsapp, text), "_blank", "noopener,noreferrer");
  }
  const meta = CATEGORY_META[product.categoria];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/catalogo/${product.categoria}`} className="text-xs tracking-[0.18em] text-[#d4af37] uppercase">
        Volver
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2" data-cat={product.categoria}>
        <div className="border border-[rgba(212,175,55,0.2)] bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.22),#090909_68%)]">
          {product.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imagen_url} alt={product.nombre} className="aspect-[4/5] w-full object-contain p-6" />
          ) : (
            <div className="aspect-[4/5]">
              <Bottle label={product.nombre} />
            </div>
          )}
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-[var(--accent)] uppercase">{meta.label}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-6xl">{product.nombre}</h1>
          <p className="mt-3 text-sm text-[#f6f1e7]/70">
            {formatTalla(product.talla_ml)}
            {product.subcategoria ? ` · ${product.subcategoria}` : ""}
          </p>
          <p className="mt-4 border border-[rgba(212,175,55,0.28)] px-4 py-3 text-base leading-7 text-[#f6f1e7]">
            {perfilAroma(product).frase}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#e8d5a3]/90">
            Aroma equivalente. Fragancia inspirada, no es el producto original de la marca.
          </p>
          <div className="mt-6">
            {promo ? <p className="text-sm text-[#f6f1e7]/45 line-through">{formatCOP(product.precio)}</p> : null}
            {baja ? <p className="text-base text-[#f6f1e7]/45 line-through">{formatCOP(detalle)} cada uno</p> : null}
            <p className="font-serif text-5xl text-[#e8d5a3]">{formatCOP(unitario * cantidad)}</p>
            <p className="mt-1 text-lg text-[#f6f1e7]/75">
              {cantidad === 1 ? "1 perfume" : `${cantidad} perfumes`}
              {cantidad > 1 ? ` · ${formatCOP(unitario)} cada uno` : ""}
            </p>
          </div>
          <div className="mt-6">
            <p className="text-lg text-[#f6f1e7]">¿Cuántos quiere?</p>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" className="min-h-14 min-w-24 border border-[rgba(212,175,55,0.45)] px-4 text-base" onClick={() => setCantidad((value) => Math.max(1, value - 1))}>
                Menos
              </button>
              <span className="min-w-10 text-center font-serif text-4xl">{cantidad}</span>
              <button type="button" className="min-h-14 min-w-24 border border-[rgba(212,175,55,0.45)] px-4 text-base" onClick={() => setCantidad((value) => Math.min(99, value + 1))}>
                Más
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {CANTIDADES_MAYOR.map((unidades) => (
                <button
                  key={unidades}
                  type="button"
                  className={`min-h-12 px-4 text-left text-base ${cantidad === unidades ? "bg-[#d4af37] text-[#1a1203]" : "border border-[rgba(212,175,55,0.35)] text-[#f6f1e7]"}`}
                  onClick={() => setCantidad(unidades)}
                >
                  {unidades} perfumes · {formatCOP(precioUnitario(product, unidades))} cada uno
                </button>
              ))}
            </div>
            {cantidad >= 12 && reventa.porUnidad > 0 ? (
              <p className="mt-3 text-base leading-6 text-[#e8d5a3]">
                Si los vende a {formatCOP(reventa.venta)}, le quedan {formatCOP(reventa.porUnidad)} en cada uno.
              </p>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4">
            {whatsapp ? (
              <button type="button" className="btn-facil" disabled={!product.disponible} onClick={comprarPorWhatsapp}>
                {!product.disponible ? "Agotado" : `Lo quiero por WhatsApp · ${formatCOP(unitario * cantidad)}`}
              </button>
            ) : null}
            <button
              type="button"
              className="text-base text-[#e8d5a3] underline disabled:opacity-40"
              disabled={!product.disponible}
              onClick={() => {
                add(product.id, cantidad, product.nombre);
                router.push("/carrito");
              }}
            >
              Quiero llevarlo con otros perfumes
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#f6f1e7]/70">
            {entrega} {pago}
          </p>
          {enPedido > 0 ? (
            <p className="mt-3 text-base text-[#e8d5a3]">Ya está en su lista: {enPedido}. En total lleva {count}.</p>
          ) : null}
          <ShareButton
            label="Compartir este perfume"
            title={product.nombre}
            text={`${product.nombre}. ${perfilAroma(product).frase}`}
          />
          {product.video_url ? (
            <a href={product.video_url} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
              Ver video y disponibilidad
            </a>
          ) : null}
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">También le puede gustar</h2>
          <div className="mt-6">
            <ProductGrid products={related} whatsapp={whatsapp} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
