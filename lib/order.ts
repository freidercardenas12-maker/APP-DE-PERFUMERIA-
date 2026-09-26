import { CATEGORY_META } from "@/lib/categories";
import { formatCOP, formatTalla } from "@/lib/format";
import type { ClientePedido, Producto } from "@/lib/types";

export function mensajePedido(
  lineas: { producto: Producto; cantidad: number; unitario: number }[],
  cliente: ClientePedido,
): string {
  const total = lineas.reduce((sum, linea) => sum + linea.unitario * linea.cantidad, 0);
  const referencias = lineas.map((linea, index) => {
    const lineaCatalogo = CATEGORY_META[linea.producto.categoria].label;
    const talla = formatTalla(linea.producto.talla_ml);
    const subtotal = formatCOP(linea.unitario * linea.cantidad);
    const unitario = formatCOP(linea.unitario);
    return [
      `*${index + 1}. ${linea.producto.nombre}*`,
      `${lineaCatalogo} · ${talla}`,
      `Cantidad: ${linea.cantidad} × ${unitario}`,
      `Subtotal: ${subtotal}`,
    ].join("\n");
  });

  return [
    "*AURA & ESSENTIA*",
    "Pedido al por mayor",
    "",
    "*Referencias solicitadas*",
    referencias.join("\n\n"),
    "",
    `*Total del pedido: ${formatCOP(total)}*`,
    "Precios mayoristas. El envío se confirma por este chat.",
    "",
    "*Datos del cliente*",
    `Nombre: ${cliente.nombre.trim()}`,
    `Ciudad: ${cliente.ciudad.trim()}`,
    `Teléfono: ${cliente.telefono.trim()}`,
  ].join("\n");
}
