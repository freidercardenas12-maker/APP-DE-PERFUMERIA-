"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartLine = { id: string; cantidad: number };
type Toast = { id: number; text: string };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  toast: Toast | null;
  add: (id: string, cantidad?: number, nombre?: string) => void;
  setCantidad: (id: string, cantidad: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pm-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          setLines(parsed.filter((line) => line && typeof line.id === "string" && line.cantidad > 0));
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.cantidad, 0);
    return {
      lines,
      ready,
      count,
      toast,
      add: (id, cantidad = 1, nombre) => {
        setLines((current) => {
          const found = current.find((line) => line.id === id);
          if (!found) return [...current, { id, cantidad }];
          return current.map((line) =>
            line.id === id ? { ...line, cantidad: Math.min(99, line.cantidad + cantidad) } : line,
          );
        });
        setToast({ id: Date.now(), text: nombre ? `${nombre} se agregó al pedido` : "Producto agregado" });
      },
      setCantidad: (id, cantidad) => {
        const next = Math.max(1, Math.min(99, cantidad));
        setLines((current) => current.map((line) => (line.id === id ? { ...line, cantidad: next } : line)));
      },
      remove: (id) => setLines((current) => current.filter((line) => line.id !== id)),
      clear: () => setLines([]),
    };
  }, [lines, ready, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 items-center justify-between gap-3 border border-[rgba(212,175,55,0.45)] bg-[#121212] px-4 py-3 text-sm text-[#e8d5a3] shadow-2xl">
          <p>{toast.text}</p>
          <Link href="/carrito" className="shrink-0 text-xs tracking-[0.14em] text-[#d4af37] uppercase">
            Ver pedido
          </Link>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
