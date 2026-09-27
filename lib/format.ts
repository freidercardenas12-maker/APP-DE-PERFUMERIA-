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

function escalaPrecio(piso: number) {
  const doce = piso;
  const seis = Math.max(Math.ceil((piso * 1.05) / 1000) * 1000, doce + 1000);
  const tres = Math.max(Math.ceil((piso * 1.1) / 1000) * 1000, seis + 1000);
  const uno = Math.max(Math.ceil((piso * 1.15) / 1000) * 1000, tres + 1000);
  return { uno, tres, seis, doce };
}

export function precioUnitario(producto: Pick<Producto, "precio" | "precio_promocion">, cantidad: number): number {
  const escala = escalaPrecio(precioVigente(producto));
  const qty = Math.max(1, Math.floor(cantidad) || 1);
  if (qty >= 12) return escala.doce;
  if (qty >= 6) return escala.seis;
  if (qty >= 3) return escala.tres;
  return escala.uno;
}

export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
