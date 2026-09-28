"use client";

import { useCart } from "@/components/CartProvider";
import { formatCOP, formatTalla, precioUnitario, waLink } from "@/lib/format";
import { mensajePedido } from "@/lib/order";
import type { Ajustes, ClientePedido, Producto } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const EMPTY: ClientePedido = { nombre: "", ciudad: "", telefono: "" };

export function CartView({ products, settings }: { products: Producto[]; settings: Ajustes }) {
  const { lines, ready, setCantidad, remove, clear } = useCart();
  const [cliente, setCliente] = useState<ClientePedido>(EMPTY);
  const [error, setError] = useState("");
  const [listo, setListo] = useState<{ total: number; href: string } | null>(null);

  const rows = useMemo(() => {
    return lines.map((line) => {
      const producto = products.find((product) => product.id === line.id);
      if (!producto) return { missing: true as const, id: line.id, cantidad: line.cantidad };
      return {
        missing: false as const,
        producto,
        cantidad: line.cantidad,
        unitario: precioUnitario(producto, line.cantidad),
        base: precioUnitario(producto, 1),
      };
    });
  }, [lines, products]);

  const comprables = rows.flatMap((row) =>
    !row.missing && row.producto.disponible ? [{ producto: row.producto, cantidad: row.cantidad, unitario: row.unitario }] : [],
  );
  const total = comprables.reduce((sum, row) => sum + row.unitario * row.cantidad, 0);

  function enviar() {
    if (!ready) return;
    if (comprables.length === 0) {
      setError("Agrega al menos un producto disponible.");
      return;
    }
    if (!cliente.nombre.trim() || !cliente.ciudad.trim() || !cliente.telefono.trim()) {
      setError("Completa nombre, ciudad y teléfono.");
      return;
    }
    if (!settings.whatsapp) {
      setError("El negocio todavía no configura el WhatsApp de pedidos. Se hace en el panel de administración.");
      return;
    }
    const href = waLink(
      settings.whatsapp,
      mensajePedido(
        comprables.map((row) => ({ producto: row.producto, cantidad: row.cantidad, unitario: row.unitario })),
        cliente,
      ),
    );
    const enlace = document.createElement("a");
    enlace.href = href;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    clear();
    setCliente(EMPTY);
    setError("");
    setListo({ total, href });
  }

  if (listo) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-xs tracking-[0.22em] text-[#d4af37] uppercase">Pedido enviado</p>
        <h1 className="mt-3 font-serif text-5xl">Listo</h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[#f6f1e7]/75">
          El total fue {formatCOP(listo.total)}. El mensaje ya está en WhatsApp. Si no se abrió, ábrelo aquí. El pedido quedó vacío para la siguiente compra.
        </p>
        <a href={listo.href} target="_blank" rel="noreferrer" className="btn-gold mt-8">
          Abrir WhatsApp
        </a>
        <Link href="/catalogo/dama" className="btn-ghost mt-3">
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-serif text-4xl">Tu pedido</h1>
      <p className="mt-2 text-sm leading-6 text-[#f6f1e7]/65">{settings.entrega}</p>

      {!ready ? <p className="mt-8 text-sm text-[#e8d5a3]">Cargando pedido…</p> : null}

      {ready && lines.length === 0 ? (
        <div className="mt-8 border border-dashed border-[rgba(212,175,55,0.35)] px-6 py-16 text-center">
          <p>Tu pedido está vacío.</p>
          <Link href="/catalogo/dama" className="btn-gold mt-6">
            Ver catálogo
          </Link>
        </div>
      ) : null}

      {ready && lines.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.2)]">
            {rows.map((row) =>
              row.missing ? (
                <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-4">
                  <p>Este producto ya no está en el catálogo.</p>
                  <button type="button" className="text-sm text-[#e8d5a3] underline" onClick={() => remove(row.id)}>
                    Quitar
                  </button>
                </li>
              ) : (
                <li key={row.producto.id} className="grid gap-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl leading-tight">{row.producto.nombre}</p>
                      <p className="mt-1 text-sm text-[#f6f1e7]/60">{formatTalla(row.producto.talla_ml)}</p>
                      {!row.producto.disponible ? <p className="text-xs text-red-300">Agotado: no entra al total</p> : null}
                    </div>
                    <button type="button" className="text-sm text-[#e8d5a3] underline" onClick={() => remove(row.producto.id)}>
                      Quitar
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center border border-[rgba(212,175,55,0.35)]">
                      <button type="button" className="px-4 py-2" aria-label="Disminuir" onClick={() => setCantidad(row.producto.id, row.cantidad - 1)}>
                        −
                      </button>
                      <span className="min-w-8 text-center">{row.cantidad}</span>
                      <button type="button" className="px-4 py-2" aria-label="Aumentar" onClick={() => setCantidad(row.producto.id, row.cantidad + 1)}>
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e8d5a3]">{formatCOP(row.unitario * row.cantidad)}</p>
                      {row.unitario < row.base ? <p className="text-xs text-[#f6f1e7]/60">{formatCOP(row.unitario)} c/u</p> : null}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
          <p className="mt-3 text-sm text-[#f6f1e7]/60">Desde 12 unidades del mismo perfume baja el precio.</p>
          <p className="mt-4 text-right font-serif text-3xl text-[#e8d5a3]">{formatCOP(total)}</p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              enviar();
            }}
          >
            <label className="text-sm text-[#e8d5a3]">
              Nombre
              <input required autoComplete="name" value={cliente.nombre} onChange={(event) => setCliente({ ...cliente, nombre: event.target.value })} className="field mt-2" />
            </label>
            <label className="text-sm text-[#e8d5a3]">
              Ciudad
              <input
                required
                autoComplete="address-level2"
                value={cliente.ciudad}
                onChange={(event) => setCliente({ ...cliente, ciudad: event.target.value })}
                className="field mt-2"
              />
            </label>
            <label className="text-sm text-[#e8d5a3]">
              Teléfono
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={cliente.telefono}
                onChange={(event) => setCliente({ ...cliente, telefono: event.target.value })}
                className="field mt-2"
              />
            </label>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button type="submit" className="btn-gold w-full">
              Enviar pedido · {formatCOP(total)}
            </button>
            <button type="button" className="text-sm text-[#f6f1e7]/60 underline" onClick={clear}>
              Vaciar pedido
            </button>
            <p className="text-center text-sm leading-6 text-[#f6f1e7]/60">{settings.pago}</p>
          </form>
        </>
      ) : null}
    </div>
  );
}
