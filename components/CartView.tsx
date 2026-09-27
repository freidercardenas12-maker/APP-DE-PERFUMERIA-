"use client";

import { useCart } from "@/components/CartProvider";
import { CATEGORY_META } from "@/lib/categories";
import { CANTIDADES_MAYOR, formatCOP, formatTalla, precioUnitario, waLink } from "@/lib/format";
import { mensajePedido } from "@/lib/order";
import type { Ajustes, ClientePedido, Producto } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const EMPTY: ClientePedido = { nombre: "", ciudad: "", telefono: "" };

export function CartView({ products, settings }: { products: Producto[]; settings: Ajustes }) {
  const { lines, ready, setCantidad, remove, clear } = useCart();
  const [cliente, setCliente] = useState<ClientePedido>(EMPTY);
  const [error, setError] = useState("");

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
    const text = mensajePedido(
      comprables.map((row) => ({ producto: row.producto, cantidad: row.cantidad, unitario: row.unitario })),
      cliente,
    );
    window.open(waLink(settings.whatsapp, text), "_blank", "noopener,noreferrer");
    setError("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-4xl md:text-6xl">Tu pedido</h1>
      <p className="mt-2 text-sm text-[#f6f1e7]/65">
        Precios mayoristas y al detal. Arma la lista y envíala por WhatsApp.
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#e8d5a3]">
        {settings.entrega} {settings.pago}
      </p>

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
          <ul className="mt-8 divide-y divide-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.2)] md:hidden">
            {rows.map((row) =>
              row.missing ? (
                <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-4">
                  <p>Este producto ya no está en el catálogo.</p>
                  <button type="button" className="text-[#e8d5a3] underline" onClick={() => remove(row.id)}>
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
                      <button
                        type="button"
                        className="px-4 py-2"
                        aria-label="Disminuir"
                        onClick={() => setCantidad(row.producto.id, row.cantidad - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center">{row.cantidad}</span>
                      <button
                        type="button"
                        className="px-4 py-2"
                        aria-label="Aumentar"
                        onClick={() => setCantidad(row.producto.id, row.cantidad + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e8d5a3]">{formatCOP(row.unitario * row.cantidad)}</p>
                      {row.unitario < row.base ? (
                        <p className="text-xs text-[#f6f1e7]/60">{formatCOP(row.unitario)} c/u</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CANTIDADES_MAYOR.map((unidades) => (
                      <button
                        key={unidades}
                        type="button"
                        className={`border px-2 py-1 text-[0.65rem] tracking-[0.08em] uppercase ${row.cantidad === unidades ? "border-[#d4af37] text-[#e8d5a3]" : "border-[rgba(212,175,55,0.28)] text-[#f6f1e7]/70"}`}
                        onClick={() => setCantidad(row.producto.id, unidades)}
                      >
                        {unidades} und.
                      </button>
                    ))}
                  </div>
                </li>
              ),
            )}
          </ul>
          <div className="mt-8 hidden overflow-x-auto border border-[rgba(212,175,55,0.2)] md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[0.68rem] tracking-[0.14em] text-[#d4af37] uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Talla</th>
                  <th className="px-4 py-3 font-medium">Cant.</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Subtotal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  row.missing ? (
                    <tr key={row.id} className="border-t border-[rgba(212,175,55,0.15)]">
                      <td className="px-4 py-4" colSpan={5}>
                        Este producto ya no está en el catálogo.
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" className="text-[#e8d5a3] underline" onClick={() => remove(row.id)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.producto.id} className="border-t border-[rgba(212,175,55,0.15)]">
                      <td className="px-4 py-4">
                        <p className="font-serif text-xl">{row.producto.nombre}</p>
                        {!row.producto.disponible ? <p className="text-xs text-red-300">Agotado: no entra al total</p> : null}
                      </td>
                      <td className="px-4 py-4">{formatTalla(row.producto.talla_ml)}</td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={row.cantidad}
                          onChange={(event) => setCantidad(row.producto.id, Number(event.target.value) || 1)}
                          className="field w-20 py-2"
                        />
                        <div className="mt-2 flex gap-1">
                          {CANTIDADES_MAYOR.map((unidades) => (
                            <button
                              key={unidades}
                              type="button"
                              className="border border-[rgba(212,175,55,0.28)] px-1.5 py-1 text-[0.62rem] text-[#e8d5a3]"
                              onClick={() => setCantidad(row.producto.id, unidades)}
                            >
                              {unidades}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {row.unitario < row.base ? (
                          <p className="text-xs text-[#f6f1e7]/45 line-through">{formatCOP(row.base)}</p>
                        ) : null}
                        <p>{formatCOP(row.unitario)}</p>
                      </td>
                      <td className="px-4 py-4">{formatCOP(row.unitario * row.cantidad)}</td>
                      <td className="px-4 py-4">
                        <button type="button" className="text-[#e8d5a3] underline" onClick={() => remove(row.producto.id)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-right font-serif text-3xl text-[#e8d5a3]">Total: {formatCOP(total)}</p>

          <form
            className="mt-8 grid gap-4 border border-[rgba(212,175,55,0.2)] p-4 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              enviar();
            }}
          >
            <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
              Nombre
              <input
                required
                autoComplete="name"
                value={cliente.nombre}
                onChange={(event) => setCliente({ ...cliente, nombre: event.target.value })}
                className="field mt-2"
              />
            </label>
            <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
              Ciudad
              <input
                required
                autoComplete="address-level2"
                value={cliente.ciudad}
                onChange={(event) => setCliente({ ...cliente, ciudad: event.target.value })}
                className="field mt-2"
              />
            </label>
            <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
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
            {comprables.length > 0 ? (
              <section className="border border-[rgba(212,175,55,0.35)] bg-[#120e09] p-5 md:col-span-3 md:p-6">
                <p className="text-xs tracking-[0.22em] text-[#d4af37] uppercase">Así llega a WhatsApp</p>
                <h2 className="mt-3 font-serif text-3xl leading-none">Aura & Essentia</h2>
                <p className="mt-1 text-sm tracking-[0.12em] text-[#f6f1e7]/60 uppercase">Mayorista y al detal</p>
                <p className="mt-5 text-xs tracking-[0.16em] text-[#e8d5a3] uppercase">Referencias solicitadas</p>
                <ol className="mt-3 space-y-4">
                  {comprables.map((row, index) => (
                    <li key={row.producto.id} className="border-t border-[rgba(212,175,55,0.15)] pt-4">
                      <p className="font-serif text-xl leading-tight">
                        {index + 1}. {row.producto.nombre}
                      </p>
                      <p className="mt-1 text-sm text-[#f6f1e7]/65">
                        {CATEGORY_META[row.producto.categoria].label} · {formatTalla(row.producto.talla_ml)}
                      </p>
                      <p className="mt-1 text-sm">
                        Cantidad: {row.cantidad} × {formatCOP(row.unitario)}
                      </p>
                      <p className="text-sm text-[#e8d5a3]">Subtotal: {formatCOP(row.unitario * row.cantidad)}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 border-t border-[rgba(212,175,55,0.35)] pt-4 font-serif text-2xl text-[#e8d5a3]">
                  Total del pedido: {formatCOP(total)}
                </p>
                <p className="mt-1 text-sm text-[#f6f1e7]/60">
                  Los mejores precios, al por mayor y al detal. El envío se confirma por este chat.
                </p>
                <div className="mt-4 text-sm leading-6">
                  <p className="text-xs tracking-[0.16em] text-[#e8d5a3] uppercase">Datos del cliente</p>
                  <p className="mt-2">Nombre: {cliente.nombre.trim() || "—"}</p>
                  <p>Ciudad: {cliente.ciudad.trim() || "—"}</p>
                  <p>Teléfono: {cliente.telefono.trim() || "—"}</p>
                </div>
              </section>
            ) : null}
            {error ? <p className="md:col-span-3 text-sm text-red-300">{error}</p> : null}
            <div className="flex flex-wrap gap-3 md:col-span-3">
              <button type="submit" className="btn-gold">
                Enviar pedido por WhatsApp
              </button>
              <button type="button" className="btn-ghost" onClick={clear}>
                Vaciar pedido
              </button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}
