"use client";

import { Bottle } from "@/components/Bottle";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { formatCOP, formatTalla, precioVigente, tienePromo } from "@/lib/format";
import type { Producto } from "@/lib/types";
import Link from "next/link";

export function ProductCard({ product }: { product: Producto }) {
  const { add, lines } = useCart();
  const enPedido = lines.find((line) => line.id === product.id)?.cantidad ?? 0;
  const vigente = precioVigente(product);
  const promo = tienePromo(product);

  return (
    <article data-cat={product.categoria} className="card-lift flex h-full flex-col">
      <Link href={`/producto/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.22),#090909_68%)]">
          {product.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imagen_url} alt={product.nombre} loading="lazy" className="h-full w-full object-contain p-3" />
          ) : (
            <Bottle label={product.nombre} />
          )}
          {!product.disponible ? (
            <span className="absolute top-3 left-3 bg-black/80 px-2 py-1 text-[0.65rem] tracking-[0.16em] uppercase">
              Agotado
            </span>
          ) : null}
          {promo ? (
            <span className="absolute top-3 right-3 bg-[#d4af37] px-2 py-1 text-[0.65rem] tracking-[0.14em] text-[#1a1203] uppercase">
              Promo
            </span>
          ) : null}
          {enPedido > 0 ? (
            <span className="absolute right-3 bottom-3 bg-[#d4af37] px-2 py-1 text-xs font-semibold text-[#1a1203]">
              ×{enPedido}
            </span>
          ) : null}
        </div>
        <div className="space-y-1 px-4 pt-4">
          <p className="text-[0.68rem] tracking-[0.18em] text-[var(--accent)] uppercase">
            {CATEGORY_META[product.categoria].label}
          </p>
          <h3 className="line-clamp-3 font-serif text-xl leading-tight md:text-2xl">{product.nombre}</h3>
          <p className="text-sm text-[#f6f1e7]/60">{formatTalla(product.talla_ml)}</p>
        </div>
      </Link>
      <div className="mt-auto grid gap-3 px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
        <div>
          {promo ? <p className="text-xs text-[#f6f1e7]/45 line-through">{formatCOP(product.precio)}</p> : null}
          <p className="text-lg text-[#e8d5a3]">{formatCOP(vigente)}</p>
        </div>
        <button
          type="button"
          className={`${enPedido > 0 ? "btn-added" : "btn-gold"} w-full px-3 py-2 text-[0.68rem]`}
          disabled={!product.disponible}
          onClick={() => add(product.id, 1, product.nombre)}
        >
          {!product.disponible ? "Agotado" : enPedido > 0 ? `Agregado · ${enPedido}` : "Agregar"}
        </button>
      </div>
    </article>
  );
}
