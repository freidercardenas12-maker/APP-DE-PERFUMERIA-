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

export const CANTIDADES_MAYOR = [3, 6, 12] as const;

const TRAMOS_CANTIDAD = [
  { desde: 12, factor: 0.88 },
  { desde: 6, factor: 0.92 },
  { desde: 3, factor: 0.95 },
] as const;

export function precioUnitario(producto: Pick<Producto, "precio" | "precio_promocion">, cantidad: number): number {
  const base = precioVigente(producto);
  const qty = Math.max(1, Math.floor(cantidad) || 1);
  const tramo = TRAMOS_CANTIDAD.find((item) => qty >= item.desde);
  if (!tramo) return base;
  const redondeado = Math.round((base * tramo.factor) / 500) * 500;
  if (redondeado < base && redondeado >= 500) return redondeado;
  const menor = Math.floor((base * tramo.factor) / 500) * 500;
  return menor >= 500 && menor < base ? menor : base;
}

export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
