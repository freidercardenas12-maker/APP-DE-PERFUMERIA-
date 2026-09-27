import { CATEGORY_META } from "@/lib/categories";
import { formatCOP, formatTalla, precioUnitario } from "@/lib/format";
import type { ClientePedido, Producto } from "@/lib/types";

export function mensajeConsulta(input: {
  nombre: string;
  linea: string;
  talla: string;
  aroma: string;
  cantidad: number;
  unitario: number;
  url: string;
  reventa?: string;
}): string {
  return [
    "Hola! Quiero información de este perfume.",
    "",
    `*${input.nombre}*`,
    `${input.linea} · ${input.talla}`,
    input.aroma,
    `Cantidad: ${input.cantidad}`,
    `Precio por unidad: ${formatCOP(input.unitario)}`,
    `Total: ${formatCOP(input.unitario * input.cantidad)}`,
    input.reventa ?? "",
    "",
    input.url,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

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
    const porCantidad = linea.unitario < precioUnitario(linea.producto, 1) ? ` (precio por ${linea.cantidad} unidades)` : "";
    return [
      `*${index + 1}. ${linea.producto.nombre}*`,
      `${lineaCatalogo} · ${talla}`,
      `Cantidad: ${linea.cantidad} × ${unitario}${porCantidad}`,
      `Subtotal: ${subtotal}`,
    ].join("\n");
  });

  return [
    "*AURA & ESSENTIA*",
    "Pedido al por mayor y al detal",
    "",
    "*Referencias solicitadas*",
    referencias.join("\n\n"),
    "",
    `*Total del pedido: ${formatCOP(total)}*`,
    "Los mejores precios, al por mayor y al detal. El envío se confirma por este chat.",
    "",
    "*Datos del cliente*",
    `Nombre: ${cliente.nombre.trim()}`,
    `Ciudad: ${cliente.ciudad.trim()}`,
    `Teléfono: ${cliente.telefono.trim()}`,
  ].join("\n");
}
