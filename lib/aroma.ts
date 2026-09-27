import type { Producto } from "@/lib/types";

type ConAroma = Pick<Producto, "nombre" | "categoria" | "notas" | "talla_ml"> & {
  subcategoria?: Producto["subcategoria"] | null;
};

export type PerfilAroma = {
  para: string;
  ocasion: string | null;
  huele: string | null;
  frase: string;
};

const DICCIONARIO: Record<string, string> = {
  dulce: "dulce",
  avainillado: "vainilla",
  afrutados: "frutas",
  "floral blanco": "flores",
  florales: "flores",
  "floral amarillo": "flores",
  nardos: "flores",
  rosas: "rosa",
  violeta: "violeta",
  iris: "iris",
  cítrico: "cítricos",
  amaderado: "madera",
  ámbar: "ámbar",
  atalcado: "talco",
  almizclado: "almizcle",
  fresco: "fresco",
  aromático: "hierbas",
  herbal: "hierbas",
  lavanda: "lavanda",
  verde: "verde",
  "fresco especiado": "especias",
  "especiado suave": "especias",
  "cálido especiado": "especias",
  tropical: "tropical",
  acuático: "agua",
  marino: "mar",
  ozónico: "aire fresco",
  lactónico: "crema",
  coco: "coco",
  caramelo: "caramelo",
  cacao: "cacao",
  chocolate: "chocolate",
  amielado: "miel",
  "cera de abeja": "miel",
  acerezado: "cereza",
  almendrado: "almendra",
  nueces: "nuez",
  café: "café",
  ron: "ron",
  champán: "champán",
  cuero: "cuero",
  tabaco: "tabaco",
  pachulí: "pachulí",
  balsámico: "balsámico",
};

const PREFERENCIA = [
  "vainilla",
  "dulce",
  "flores",
  "rosa",
  "frutas",
  "cítricos",
  "ámbar",
  "madera",
  "coco",
  "chocolate",
  "caramelo",
  "miel",
  "cereza",
  "café",
  "cuero",
  "tabaco",
  "tropical",
  "crema",
  "talco",
  "fresco",
  "almizcle",
  "especias",
];

function unir(lista: string[]): string {
  if (lista.length === 1) return lista[0];
  if (lista.length === 2) return `${lista[0]} y ${lista[1]}`;
  return `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}`;
}

function hueleA(notas: string[]): string | null {
  const dichos = new Set<string>();
  for (const nota of notas) {
    const dicho = DICCIONARIO[nota];
    if (dicho) dichos.add(dicho);
  }
  const ordenados = PREFERENCIA.filter((item) => dichos.has(item));
  const lista = ordenados.slice(0, 3);
  return lista.length > 0 ? unir(lista) : null;
}

function ocasionDeNotas(notas: string[]): string | null {
  const tiene = (...claves: string[]) => claves.some((clave) => notas.includes(clave));
  if (tiene("dulce", "avainillado", "caramelo", "chocolate", "cacao", "amielado", "coco", "lactónico")) {
    return "Ideal para cita y regalo";
  }
  if (tiene("fresco", "cítrico", "acuático", "marino", "ozónico", "verde", "herbal")) {
    return "Ideal para el día y la oficina";
  }
  if (tiene("amaderado", "ámbar", "cuero", "tabaco", "pachulí", "cálido especiado", "balsámico")) {
    return "Ideal para la noche";
  }
  if (tiene("florales", "floral blanco", "floral amarillo", "rosas", "violeta", "nardos")) {
    return "Ideal para regalo";
  }
  return null;
}

function ocasionDeNombre(nombre: string): string | null {
  const plano = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/\b(aqua|acqua|blue|bleu|fresh|ice|sport|cool|wave|marine|marino)\b/.test(plano)) return "Ideal para el día";
  if (/\b(oud|elixir|noir|black|night|nocturne|intenso|intense|tobacco|tabac)\b/.test(plano)) return "Ideal para la noche";
  if (/\b(sweet|candy|vanilla|sugar|cherry)\b/.test(plano)) return "Ideal para cita y regalo";
  return null;
}

function paraQuien(product: ConAroma): string {
  if (product.categoria === "dama" || product.subcategoria === "dama" || /\bdama\b/i.test(product.nombre)) return "Para ella";
  if (product.categoria === "caballero" || product.subcategoria === "caballero") return "Para él";
  return "Para ella y para él";
}

export function perfilAroma(product: ConAroma): PerfilAroma {
  if (product.talla_ml == null && /aerosol/i.test(product.nombre)) {
    const para = paraQuien(product);
    return { para, ocasion: null, huele: null, frase: `${para}. Presentación en aerosol, para probar o llevar.` };
  }
  if (product.talla_ml == null) {
    return { para: "Accesorio", ocasion: null, huele: null, frase: "Accesorio para llevar el perfume de viaje." };
  }

  const para = paraQuien(product);
  const huele = hueleA(product.notas);
  const ocasion = ocasionDeNotas(product.notas) ?? ocasionDeNombre(product.nombre);
  const linea =
    product.categoria === "arabe" ? "Aroma árabe" : product.categoria === "caballero" ? "Aroma de caballero" : "Aroma de dama";
  const partes = [huele ? `Huele a ${huele}` : linea, para, ocasion].filter(Boolean);
  return { para, ocasion, huele, frase: `${partes.join(". ")}.` };
}
