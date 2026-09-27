"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartLine = { id: string; cantidad: number };
type Toast = { id: number; nombre: string; total: number };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  toast: Toast | null;
  add: (id: string, cantidad?: number, nombre?: string) => void;
  addVarios: (items: { id: string; cantidad?: number }[], nombre: string) => void;
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
        const found = lines.find((line) => line.id === id);
        const nextQty = Math.min(99, (found?.cantidad ?? 0) + cantidad);
        const total = count - (found?.cantidad ?? 0) + nextQty;
        setLines((current) => {
          const existing = current.find((line) => line.id === id);
          if (!existing) return [...current, { id, cantidad: Math.min(99, cantidad) }];
          return current.map((line) =>
            line.id === id ? { ...line, cantidad: Math.min(99, line.cantidad + cantidad) } : line,
          );
        });
        setToast({ id: Date.now(), nombre: nombre || "Perfume", total });
      },
      addVarios: (items, nombre) => {
        const additions = items
          .filter((item) => item.id)
          .map((item) => ({ id: item.id, cantidad: Math.min(99, Math.max(1, item.cantidad ?? 1)) }));
        setLines((current) => {
          const next = current.map((line) => ({ ...line }));
          for (const item of additions) {
            const index = next.findIndex((line) => line.id === item.id);
            if (index === -1) next.push(item);
            else next[index] = { ...next[index], cantidad: Math.min(99, next[index].cantidad + item.cantidad) };
          }
          return next;
        });
        const total = count + additions.reduce((sum, item) => sum + item.cantidad, 0);
        setToast({ id: Date.now(), nombre, total });
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
        <div
          role="status"
          className="toast-in fixed top-[4.75rem] left-1/2 z-[80] w-[min(92vw,440px)] -translate-x-1/2 border-2 border-[#d4af37] bg-[#120e09] px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.65)]"
        >
          <p className="text-xs tracking-[0.2em] text-[#d4af37] uppercase">Agregado al pedido</p>
          <p className="mt-1 font-serif text-2xl leading-tight text-[#f6f1e7]">{toast.nombre}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-[#e8d5a3]">
              Llevas <span className="font-semibold text-[#f3e0a8]">{toast.total}</span>{" "}
              {toast.total === 1 ? "perfume" : "perfumes"}
            </p>
            <Link href="/carrito" className="btn-gold shrink-0 px-3 py-2 text-[0.68rem]">
              Ver pedido
            </Link>
          </div>
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
