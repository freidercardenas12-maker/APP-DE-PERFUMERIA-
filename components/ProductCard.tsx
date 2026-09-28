"use client";

import { perfilAroma } from "@/lib/aroma";
import { Bottle } from "@/components/Bottle";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { CANTIDADES_MAYOR, formatCOP, formatTalla, gananciaReventa, precioUnitario, tienePromo, waLink } from "@/lib/format";
import { mensajeCompra } from "@/lib/order";
import type { Producto } from "@/lib/types";
import Link from "next/link";

export function ProductCard({ product, whatsapp = "" }: { product: Producto; whatsapp?: string }) {
  const { add, lines, setCantidad } = useCart();
  const enPedido = lines.find((line) => line.id === product.id)?.cantidad ?? 0;
  const detalle = precioUnitario(product, 1);
  const reventa = gananciaReventa(product);
  const promo = tienePromo(product);

  function llevar(cantidad: number) {
    if (!product.disponible) return;
    if (enPedido === 0) add(product.id, cantidad, product.nombre);
    else setCantidad(product.id, cantidad);
  }

  function llevarDocena() {
    if (!product.disponible) return;
    if (enPedido === 0 || enPedido >= 12) add(product.id, 12, product.nombre);
    else setCantidad(product.id, 12);
  }

  function comprarUno() {
    if (!product.disponible || !whatsapp) return;
    const text = mensajeCompra({
      nombre: product.nombre,
      linea: CATEGORY_META[product.categoria].label,
      talla: formatTalla(product.talla_ml),
      aroma: perfilAroma(product).frase,
      cantidad: 1,
      unitario: detalle,
      url: `${window.location.origin}/producto/${product.id}`,
    });
    window.open(waLink(whatsapp, text), "_blank", "noopener,noreferrer");
  }

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
          <p className="line-clamp-2 text-xs leading-5 text-[#f6f1e7]/75">{perfilAroma(product).frase}</p>
        </div>
      </Link>
      <div className="mt-auto grid gap-3 px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
        <div>
          {promo ? <p className="text-xs text-[#f6f1e7]/45 line-through">{formatCOP(product.precio)}</p> : null}
          <p className="text-lg text-[#e8d5a3]">{formatCOP(detalle)}</p>
          <p className="text-[0.68rem] text-[#f6f1e7]/70">12 und. {formatCOP(reventa.compra)} c/u</p>
          {reventa.porUnidad > 0 ? (
            <p className="text-[0.68rem] leading-4 text-[#e8d5a3]">
              Si las vendes a {formatCOP(reventa.venta)}, te quedan {formatCOP(reventa.porUnidad)} c/u
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {CANTIDADES_MAYOR.filter((cantidad) => cantidad < 12).map((cantidad) => (
            <button
              key={cantidad}
              type="button"
              disabled={!product.disponible}
              className="border border-[rgba(212,175,55,0.35)] py-1.5 text-[0.62rem] tracking-[0.06em] text-[#e8d5a3] uppercase disabled:opacity-40"
              onClick={() => llevar(cantidad)}
            >
              {cantidad} und. · {formatCOP(precioUnitario(product, cantidad))}
            </button>
          ))}
        </div>
        {whatsapp ? (
          <button
            type="button"
            className="btn-gold w-full px-3 py-2 text-[0.68rem]"
            disabled={!product.disponible}
            onClick={comprarUno}
          >
            {!product.disponible ? "Agotado" : "Comprar 1 por WhatsApp"}
          </button>
        ) : (
          <button
            type="button"
            className="btn-gold w-full px-3 py-2 text-[0.68rem]"
            disabled={!product.disponible}
            onClick={() => add(product.id, 1, product.nombre)}
          >
            {!product.disponible ? "Agotado" : `Agregar 1 · ${formatCOP(detalle)}`}
          </button>
        )}
        <button
          type="button"
          className="btn-ghost w-full px-3 py-2 text-[0.68rem]"
          disabled={!product.disponible}
          onClick={llevarDocena}
        >
          {`Llevar 12 · ${formatCOP(reventa.compra)}`}
        </button>
      </div>
    </article>
  );
}
