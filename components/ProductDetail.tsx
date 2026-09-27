"use client";

import { perfilAroma } from "@/lib/aroma";
import { Bottle } from "@/components/Bottle";
import { ProductGrid } from "@/components/ProductGrid";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { CANTIDADES_MAYOR, formatCOP, formatTalla, precioUnitario, precioVigente, tienePromo } from "@/lib/format";
import type { Producto } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

export function ProductDetail({ product, related }: { product: Producto; related: Producto[] }) {
  const { add, lines, count } = useCart();
  const enPedido = lines.find((line) => line.id === product.id)?.cantidad ?? 0;
  const [cantidad, setCantidad] = useState(1);
  const vigente = precioVigente(product);
  const unitario = precioUnitario(product, cantidad);
  const promo = tienePromo(product);
  const porCantidad = unitario < vigente;
  const meta = CATEGORY_META[product.categoria];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/catalogo/${product.categoria}`} className="text-xs tracking-[0.18em] text-[#d4af37] uppercase">
        Volver al catálogo
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
            Presentación: {formatTalla(product.talla_ml)} · Calidad 1.1
            {product.subcategoria ? ` · ${product.subcategoria}` : ""}
          </p>
          <p className="mt-4 border border-[rgba(212,175,55,0.28)] px-4 py-3 text-base leading-7 text-[#f6f1e7]">
            {perfilAroma(product).frase}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#e8d5a3]/90">
            Aroma equivalente. Fragancia inspirada, no es el producto original de la marca.
          </p>
          <div className="mt-6">
            <p className="text-base tracking-[0.18em] text-[#e8d5a3] uppercase">Precio mayorista y al detal</p>
            <p className="mt-1 text-xs tracking-[0.16em] text-[#d4af37] uppercase">Los mejores precios</p>
            {promo ? <p className="text-sm text-[#f6f1e7]/45 line-through">{formatCOP(product.precio)}</p> : null}
            {porCantidad ? <p className="text-sm text-[#f6f1e7]/45 line-through">{formatCOP(vigente)}</p> : null}
            <p className="font-serif text-4xl text-[#e8d5a3]">{formatCOP(unitario)}</p>
            <p className="mt-1 text-sm text-[#f6f1e7]/70">
              por unidad · {cantidad} {cantidad === 1 ? "unidad" : "unidades"} · {formatCOP(unitario * cantidad)}
            </p>
            {porCantidad ? (
              <p className="mt-1 text-sm text-[#e8d5a3]">Ahorras {formatCOP(vigente - unitario)} en cada una.</p>
            ) : (
              <p className="mt-1 text-sm text-[#e8d5a3]">Desde 3 unidades baja el precio. Desde 6 queda mejor.</p>
            )}
          </div>
          {product.notas.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs tracking-[0.16em] text-[#f6f1e7]/50 uppercase">Notas olfativas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.notas.map((note) => (
                  <span key={note} className="chip">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {CANTIDADES_MAYOR.map((unidades) => (
              <button
                key={unidades}
                type="button"
                className={`border px-3 py-2 text-xs tracking-[0.12em] uppercase ${cantidad === unidades ? "border-[#d4af37] bg-[#d4af37] text-[#1a1203]" : "border-[rgba(212,175,55,0.35)] text-[#e8d5a3]"}`}
                onClick={() => setCantidad(unidades)}
              >
                {unidades} und. · {formatCOP(precioUnitario(product, unidades))}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-[rgba(212,175,55,0.35)]">
              <button type="button" className="px-4 py-3" onClick={() => setCantidad((value) => Math.max(1, value - 1))} aria-label="Disminuir">
                −
              </button>
              <span className="min-w-8 text-center">{cantidad}</span>
              <button type="button" className="px-4 py-3" onClick={() => setCantidad((value) => Math.min(99, value + 1))} aria-label="Aumentar">
                +
              </button>
            </div>
            <button
              type="button"
              className={enPedido > 0 ? "btn-added" : "btn-gold"}
              disabled={!product.disponible}
              onClick={() => add(product.id, cantidad, product.nombre)}
            >
              {!product.disponible ? "Agotado" : enPedido > 0 ? `Agregado · ${enPedido}` : "Agregar al carrito"}
            </button>
          </div>
          {enPedido > 0 ? (
            <p className="mt-3 text-sm text-[#e8d5a3]">
              Este perfume ya está en el pedido ({enPedido}). En total llevas {count} {count === 1 ? "perfume" : "perfumes"}.
            </p>
          ) : null}
          {product.video_url ? (
            <a href={product.video_url} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
              Ver video y disponibilidad
            </a>
          ) : null}
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">También te puede interesar</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
