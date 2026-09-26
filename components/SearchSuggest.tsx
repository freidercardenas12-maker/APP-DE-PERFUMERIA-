"use client";

import { CATEGORY_META } from "@/lib/categories";
import { formatTalla } from "@/lib/format";
import { buscarPerfumes, type Buscable } from "@/lib/search";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export function SearchSuggest({
  catalogo,
  value,
  onChange,
  placeholder = "Escribe cualquier letra",
  inputClassName = "field",
}: {
  catalogo: Buscable[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
}) {
  const [local, setLocal] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const text = value ?? local;

  const matches = useMemo(() => buscarPerfumes(catalogo, text).slice(0, 8), [catalogo, text]);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function write(next: string) {
    if (onChange) onChange(next);
    else setLocal(next);
    setOpen(true);
  }

  return (
    <div ref={box} className="relative min-w-0 flex-1">
      <input
        value={text}
        onChange={(event) => write(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label="Buscar perfume"
        autoComplete="off"
        className={inputClassName}
      />
      {open && text.trim() ? (
        <ul className="absolute top-full right-0 left-0 z-[80] mt-1 max-h-80 overflow-auto border border-[#d4af37] bg-[#120e09] shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          {matches.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[#f6f1e7]/70">No hay una referencia con esas letras.</li>
          ) : (
            matches.map((item) => (
              <li key={item.id} className="border-t border-[rgba(212,175,55,0.15)] first:border-t-0">
                <Link
                  href={`/producto/${item.id}`}
                  className="block px-3 py-2"
                  onClick={() => setOpen(false)}
                >
                  <span className="block font-serif text-lg leading-tight">{item.nombre}</span>
                  <span className="mt-0.5 block text-xs tracking-[0.12em] text-[#d4af37] uppercase">
                    {CATEGORY_META[item.categoria].label} · {formatTalla(item.talla_ml)}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
