"use client";

import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { formatCOP, formatTalla, precioVigente } from "@/lib/format";
import type { Producto } from "@/lib/types";
import Link from "next/link";

export function PedidoSeis({ products }: { products: Producto[] }) {
  const { addVarios } = useCart();
  if (products.length === 0) return null;
  const total = products.reduce((sum, product) => sum + precioVigente(product), 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-serif text-4xl">Un pedido de seis</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f6f1e7]/75">
        Dos de dama, dos de caballero y dos árabes. Cada perfume va a su precio de catálogo. Llevar más no baja el valor.
      </p>
      <ul className="mt-6 divide-y divide-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.2)]">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <Link href={`/producto/${product.id}`} className="font-serif text-xl leading-tight">
                {product.nombre}
              </Link>
              <p className="text-xs tracking-[0.12em] text-[#d4af37] uppercase">
                {CATEGORY_META[product.categoria].label} · {formatTalla(product.talla_ml)}
              </p>
            </div>
            <p className="text-[#e8d5a3]">{formatCOP(precioVigente(product))}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-serif text-2xl text-[#e8d5a3]">Total de estos seis: {formatCOP(total)}</p>
        <button
          type="button"
          className="btn-gold"
          onClick={() =>
            addVarios(
              products.map((product) => ({ id: product.id, cantidad: 1 })),
              "Pedido de seis",
            )
          }
        >
          Agregar los seis
        </button>
      </div>
    </section>
  );
}
