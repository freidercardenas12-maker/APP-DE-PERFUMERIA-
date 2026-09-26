"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { CATEGORY_META } from "@/lib/categories";
import { formatCOP } from "@/lib/format";
import type { Categoria, Producto, Subcategoria } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 24;

export function CatalogView({
  categoria,
  products,
}: {
  categoria: Categoria;
  products: Producto[];
}) {
  const meta = CATEGORY_META[categoria];
  const prices = products.map((product) => product.precio);
  const minBound = prices.length ? Math.min(...prices) : 0;
  const maxBound = prices.length ? Math.max(...prices) : 0;
  const notes = [...new Set(products.flatMap((product) => product.notas))].sort((a, b) => a.localeCompare(b, "es"));

  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [sub, setSub] = useState<"" | Subcategoria>("");
  const [minPrice, setMinPrice] = useState(minBound);
  const [maxPrice, setMaxPrice] = useState(maxBound);
  const [sort, setSort] = useState("nombre");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersActive =
    query.trim() !== "" ||
    note !== "" ||
    sub !== "" ||
    soloDisponibles ||
    sort !== "nombre" ||
    minPrice !== minBound ||
    maxPrice !== maxBound;

  function clearFilters() {
    setQuery("");
    setNote("");
    setSub("");
    setMinPrice(minBound);
    setMaxPrice(maxBound);
    setSort("nombre");
    setSoloDisponibles(false);
    setVisible(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (text && !product.nombre.toLowerCase().includes(text)) return false;
      if (note && !product.notas.includes(note)) return false;
      if (sub && product.subcategoria !== sub) return false;
      if (soloDisponibles && !product.disponible) return false;
      const price = product.precio;
      if (price < minPrice || price > maxPrice) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "precio-asc") return a.precio - b.precio;
      if (sort === "precio-desc") return b.precio - a.precio;
      return a.nombre.localeCompare(b.nombre, "es");
    });
    return list;
  }, [products, query, note, sub, minPrice, maxPrice, sort, soloDisponibles]);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setVisible(PAGE_SIZE);
  }

  const shown = filtered.slice(0, visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-[0.72rem] tracking-[0.2em] text-[#d4af37] uppercase">
        <Link href="/">Inicio</Link>
        <span className="px-2 text-[#f6f1e7]/40">/</span>
        Catálogo
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-[var(--accent,#d4af37)] uppercase" data-cat={categoria}>
            {meta.kicker}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl">{meta.headline}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#f6f1e7]/70">{meta.description}</p>
        </div>
        <p className="text-sm text-[#e8d5a3]">
          {filtered.length} {filtered.length === 1 ? "referencia" : "referencias"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 md:hidden">
        <button type="button" className="btn-ghost" onClick={() => setFiltersOpen((value) => !value)}>
          {filtersOpen ? "Ocultar filtros" : "Filtrar y ordenar"}
        </button>
        {filtersActive ? (
          <button type="button" className="text-sm text-[#e8d5a3] underline" onClick={clearFilters}>
            Limpiar
          </button>
        ) : null}
      </div>

      <div className={`${filtersOpen ? "grid" : "hidden"} mt-4 gap-3 border border-[rgba(212,175,55,0.2)] p-4 md:mt-8 md:grid md:grid-cols-2 xl:grid-cols-4`}>
        <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
          Buscar
          <input
            value={query}
            onChange={(event) => updateFilter(setQuery, event.target.value)}
            className="field mt-2"
            placeholder="Nombre del perfume"
          />
        </label>
        <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
          Ordenar
          <select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="field mt-2">
            <option value="nombre">Nombre</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
        <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
          Nota olfativa
          <select value={note} onChange={(event) => updateFilter(setNote, event.target.value)} className="field mt-2">
            <option value="">Todas</option>
            {notes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {categoria === "arabe" ? (
          <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Subcategoría
            <select
              value={sub}
              onChange={(event) => updateFilter(setSub, event.target.value as "" | Subcategoria)}
              className="field mt-2"
            >
              <option value="">Todas</option>
              <option value="dama">Dama</option>
              <option value="caballero">Caballero</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>
        ) : (
          <label className="flex items-end gap-2 pb-3 text-sm text-[#f6f1e7]/80">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(event) => updateFilter(setSoloDisponibles, event.target.checked)}
            />
            Solo disponibles
          </label>
        )}
        <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
          Precio desde {formatCOP(minPrice)}
          <input
            type="range"
            min={minBound}
            max={maxBound}
            value={minPrice}
            onChange={(event) => updateFilter(setMinPrice, Math.min(Number(event.target.value), maxPrice))}
            className="mt-3 w-full accent-[#d4af37]"
          />
        </label>
        <label className="block text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
          Precio hasta {formatCOP(maxPrice)}
          <input
            type="range"
            min={minBound}
            max={maxBound}
            value={maxPrice}
            onChange={(event) => updateFilter(setMaxPrice, Math.max(Number(event.target.value), minPrice))}
            className="mt-3 w-full accent-[#d4af37]"
          />
        </label>
        {categoria === "arabe" ? (
          <label className="flex items-end gap-2 pb-3 text-sm text-[#f6f1e7]/80">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(event) => updateFilter(setSoloDisponibles, event.target.checked)}
            />
            Solo disponibles
          </label>
        ) : null}
        {filtersActive ? (
          <div className="hidden items-end md:flex">
            <button type="button" className="btn-ghost" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <ProductGrid products={shown} />
      </div>
      {visible < filtered.length ? (
        <div className="mt-8 text-center">
          <button type="button" className="btn-ghost" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            Cargar más
          </button>
        </div>
      ) : null}
    </div>
  );
}
