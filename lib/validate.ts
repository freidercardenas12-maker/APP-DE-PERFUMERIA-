import { CATEGORIAS, type Ajustes, type Categoria, type Producto, type Subcategoria } from "@/lib/types";

const SUBS = new Set(["dama", "caballero", "unisex"]);

function asText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function asInt(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number);
}

export function parseProductInput(body: unknown, current?: Producto): { product: Omit<Producto, "id" | "created_at" | "updated_at"> } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Datos inválidos." };
  const input = body as Record<string, unknown>;
  const nombre = asText(input.nombre, 160);
  if (nombre.length < 2) return { error: "Escribe el nombre del producto." };

  const categoria = asText(input.categoria, 20) as Categoria;
  if (!CATEGORIAS.includes(categoria)) return { error: "Elige una categoría válida." };

  let subcategoria: Subcategoria | null = null;
  if (categoria === "arabe") {
    const sub = asText(input.subcategoria, 20);
    if (!SUBS.has(sub)) return { error: "En árabe elige subcategoría: dama, caballero o unisex." };
    subcategoria = sub as Subcategoria;
  }

  const talla = asInt(input.talla_ml);
  if (talla != null && (talla < 1 || talla > 1000)) return { error: "La talla debe estar entre 1 y 1000 ml." };

  const precio = asInt(input.precio);
  if (precio == null || precio < 0) return { error: "Escribe un precio válido en pesos." };

  const promoRaw = asInt(input.precio_promocion);
  const precio_promocion = promoRaw != null && promoRaw > 0 ? promoRaw : null;

  const notas = Array.isArray(input.notas)
    ? input.notas
    : String(input.notas ?? "")
        .split(",")
        .map((note) => note.trim().toLowerCase())
        .filter(Boolean);
  const notasLimpias = [...new Set(notas.map((note) => asText(note, 40).toLowerCase()).filter(Boolean))].slice(0, 20);

  return {
    product: {
      nombre,
      categoria,
      subcategoria,
      talla_ml: talla,
      precio,
      precio_promocion,
      notas: notasLimpias,
      imagen_url: asText(input.imagen_url ?? current?.imagen_url, 400),
      video_url: asText(input.video_url, 400),
      disponible: Boolean(input.disponible),
      destacado: Boolean(input.destacado),
    },
  };
}

export function parseSettings(body: unknown): { settings: Ajustes } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Datos inválidos." };
  const input = body as Record<string, unknown>;
  const whatsapp = asText(input.whatsapp, 20).replace(/\D/g, "");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)) {
    return { error: "El WhatsApp debe tener entre 10 y 15 dígitos, con indicativo. Ejemplo: 573001112233." };
  }
  const promoTexto = asText(input.promoTexto, 80);
  if (!promoTexto) return { error: "Escribe el texto de la promoción." };

  return {
    settings: {
      promoActiva: Boolean(input.promoActiva),
      promoTexto,
      promoSubtitulo: asText(input.promoSubtitulo, 180),
      whatsapp,
      correo: asText(input.correo, 120),
      instagram: asText(input.instagram, 200),
      sitio: asText(input.sitio, 120),
      horario: asText(input.horario, 120),
      cobertura: asText(input.cobertura, 160),
      pago: asText(input.pago, 180),
      entrega: asText(input.entrega, 180),
    },
  };
}
