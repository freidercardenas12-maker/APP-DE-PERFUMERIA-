import type { Categoria } from "@/lib/types";

export const CATEGORY_META: Record<
  Categoria,
  {
    label: string;
    nav: string;
    kicker: string;
    headline: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
  }
> = {
  dama: {
    label: "Dama",
    nav: "Dama",
    kicker: "Línea floral",
    headline: "Perfumes para dama",
    description:
      "Fragancias florales, dulces y elegantes en presentación mayorista, calidad 1.1.",
    seoTitle: "Perfumes para dama al por mayor en Colombia",
    seoDescription:
      "Catálogo mayorista de perfumes equivalencia para dama. Precios en pesos colombianos y pedido por WhatsApp.",
  },
  caballero: {
    label: "Caballero",
    nav: "Caballero",
    kicker: "Línea intensa",
    headline: "Perfumes para caballero",
    description:
      "Aromas frescos, amaderados y especiados para caballero, listos para revender.",
    seoTitle: "Perfumes para caballero al por mayor en Colombia",
    seoDescription:
      "Catálogo mayorista de perfumes equivalencia para caballero. Arma tu pedido y envíalo por WhatsApp.",
  },
  arabe: {
    label: "Árabe / Nicho",
    nav: "Árabe",
    kicker: "Nicho y casas árabes",
    headline: "Perfumes árabes y de nicho",
    description:
      "Al Haramain, Lattafa, Armaf, Rasasi y más. Presentaciones en caja, estuche y lujo.",
    seoTitle: "Perfumes árabes al por mayor en Colombia",
    seoDescription:
      "Catálogo mayorista de perfumes árabes y de nicho, unisex, dama y caballero. Pedido por WhatsApp.",
  },
};
