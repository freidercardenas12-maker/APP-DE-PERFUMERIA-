import type { Producto } from "@/lib/types";

export function formatCOP(value: number): string {
  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${formatted}`;
}

export function formatTalla(ml: number | null): string {
  if (ml == null) return "Accesorio";
  return `${ml} ml`;
}

export function formatTallaWa(ml: number | null): string {
  if (ml == null) return "";
  return `${ml}ML`;
}

export function precioVigente(producto: Pick<Producto, "precio" | "precio_promocion">): number {
  const promo = producto.precio_promocion;
  if (promo != null && promo > 0 && promo < producto.precio) return promo;
  return producto.precio;
}

export function tienePromo(producto: Pick<Producto, "precio" | "precio_promocion">): boolean {
  return precioVigente(producto) < producto.precio;
}

export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
