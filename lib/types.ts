export const CATEGORIAS = ["dama", "caballero", "arabe"] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Subcategoria = "dama" | "caballero" | "unisex";

export type Producto = {
  id: string;
  nombre: string;
  categoria: Categoria;
  subcategoria: Subcategoria | null;
  talla_ml: number | null;
  precio: number;
  precio_promocion: number | null;
  notas: string[];
  imagen_url: string;
  video_url: string;
  disponible: boolean;
  destacado: boolean;
  created_at: string;
  updated_at: string;
};

export type Ajustes = {
  promoActiva: boolean;
  promoTexto: string;
  promoSubtitulo: string;
  whatsapp: string;
  correo: string;
  instagram: string;
  sitio: string;
  horario: string;
  cobertura: string;
  pago: string;
  entrega: string;
};

export type ClientePedido = {
  nombre: string;
  ciudad: string;
  telefono: string;
};

export function isCategoria(value: string): value is Categoria {
  return CATEGORIAS.includes(value as Categoria);
}
