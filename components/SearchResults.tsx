"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { SearchSuggest } from "@/components/SearchSuggest";
import { buscarPerfumes } from "@/lib/search";
import type { Producto } from "@/lib/types";
import { useMemo, useState } from "react";

export function SearchResults({
  products,
  initialQuery,
  whatsapp = "",
}: {
  products: Producto[];
  initialQuery: string;
  whatsapp?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const matches = useMemo(() => buscarPerfumes(products, query), [products, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-4xl md:text-6xl">Buscar</h1>
      <div className="mt-6 max-w-xl">
        <SearchSuggest
          catalogo={products}
          value={query}
          onChange={setQuery}
          inputClassName="field w-full"
          placeholder="Escribe cualquier letra. Busca en dama, caballero y árabe."
        />
      </div>
      <p className="mt-6 text-sm text-[#e8d5a3]">
        {query.trim()
          ? `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”`
          : "Escribe una letra y aparecen dama, caballero y árabe."}
      </p>
      <div className="mt-6">{query.trim() ? <ProductGrid products={matches.slice(0, 48)} whatsapp={whatsapp} /> : null}</div>
    </div>
  );
}
