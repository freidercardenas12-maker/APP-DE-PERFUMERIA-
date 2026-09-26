"use client";

import { Logo } from "@/components/Logo";
import { SearchSuggest } from "@/components/SearchSuggest";
import { useCart } from "@/components/CartProvider";
import type { Buscable } from "@/lib/search";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo/dama", label: "Dama" },
  { href: "/catalogo/caballero", label: "Caballero" },
  { href: "/catalogo/arabe", label: "Árabe" },
  { href: "/contacto", label: "Contacto" },
];

export function Header({ catalogo }: { catalogo: Buscable[] }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const previous = useRef(0);

  useEffect(() => {
    if (!ready) return;
    if (count > previous.current) {
      setPop(true);
      const timer = window.setTimeout(() => setPop(false), 420);
      previous.current = count;
      return () => window.clearTimeout(timer);
    }
    previous.current = count;
  }, [count, ready]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[rgba(212,175,55,0.25)] bg-[#070707]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Logo />
        <nav className="ml-auto hidden items-center gap-6 text-[0.78rem] tracking-[0.16em] uppercase md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "text-[#d4af37]" : "text-[#f6f1e7]/80 hover:text-[#d4af37]"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden min-w-0 flex-1 md:block lg:max-w-sm lg:flex-none">
          <SearchSuggest catalogo={catalogo} inputClassName="field w-full py-2 text-sm" />
        </div>
        <Link
          href="/carrito"
          prefetch={false}
          suppressHydrationWarning
          className="ml-auto flex items-center gap-2 text-[0.75rem] tracking-[0.14em] uppercase md:ml-0"
        >
          <span>Carrito</span>
          <span
            className={`grid h-8 min-w-8 place-items-center px-1.5 font-semibold ${pop ? "cart-pop" : ""} ${
              ready && count > 0 ? "bg-[#d4af37] text-[#1a1203]" : "border border-[#d4af37] text-[#d4af37]"
            }`}
          >
            {ready ? count : 0}
          </span>
        </Link>
        <button
          type="button"
          className="btn-ghost px-3 py-2 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          Menú
        </button>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchSuggest catalogo={catalogo} inputClassName="field w-full py-2 text-sm" />
      </div>
      {open ? (
        <div className="space-y-4 border-t border-[rgba(212,175,55,0.2)] px-4 py-4 md:hidden">
          <div className="grid gap-3 text-sm tracking-[0.16em] uppercase">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
    {ready && count > 0 && pathname !== "/carrito" ? (
      <Link
        href="/carrito"
        className="fixed bottom-4 left-4 z-40 border border-[#d4af37] bg-[#121212] px-4 py-3 text-xs tracking-[0.14em] text-[#e8d5a3] uppercase shadow-lg md:hidden"
      >
        Ver pedido · {count} {count === 1 ? "perfume" : "perfumes"}
      </Link>
    ) : null}
    </>
  );
}
