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
      "Fragancias florales, dulces y elegantes. Precios mayoristas y al detal, calidad 1.1.",
    seoTitle: "Perfumes para dama al por mayor y al detal",
    seoDescription:
      "Perfumes equivalencia para dama, al por mayor y al detal. Los mejores precios y pedido por WhatsApp.",
  },
  caballero: {
    label: "Caballero",
    nav: "Caballero",
    kicker: "Línea intensa",
    headline: "Perfumes para caballero",
    description:
      "Aromas frescos, amaderados y especiados. Los mejores precios, al por mayor y al detal.",
    seoTitle: "Perfumes para caballero al por mayor y al detal",
    seoDescription:
      "Perfumes equivalencia para caballero, al por mayor y al detal. Los mejores precios y pedido por WhatsApp.",
  },
  arabe: {
    label: "Árabe / Nicho",
    nav: "Árabe",
    kicker: "Nicho y casas árabes",
    headline: "Perfumes árabes y de nicho",
    description:
      "Al Haramain, Lattafa, Armaf, Rasasi y más. Precios mayoristas y al detal, en caja, estuche y lujo.",
    seoTitle: "Perfumes árabes al por mayor y al detal",
    seoDescription:
      "Perfumes árabes y de nicho, al por mayor y al detal. Los mejores precios y pedido por WhatsApp.",
  },
};
