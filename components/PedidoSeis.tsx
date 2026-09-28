"use client";

import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { formatCOP, formatTalla, precioUnitario } from "@/lib/format";
import type { Producto } from "@/lib/types";
import Link from "next/link";

export function PedidoSeis({ products }: { products: Producto[] }) {
  const { addVarios } = useCart();
  if (products.length === 0) return null;
  const total = products.reduce((sum, product) => sum + precioUnitario(product, 1), 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-serif text-4xl">Seis para empezar</h2>
      <p className="mt-2 max-w-2xl text-lg leading-7 text-[#f6f1e7]/75">Dos para ella, dos para él y dos árabes. Un toque y quedan en su lista.</p>
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
            <p className="text-[#e8d5a3]">{formatCOP(precioUnitario(product, 1))}</p>
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
          Poner estos seis en mi lista
        </button>
      </div>
    </section>
  );
}
