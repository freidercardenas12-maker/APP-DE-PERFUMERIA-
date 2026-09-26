import { createHash } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "files", "catalogo_completo.json");
const dataDir = path.join(root, "data");

const destacados = new Set([
  "dama|Valentino Donna|100",
  "dama|Prada Paradox|100",
  "dama|CK One|100",
  "dama|Fantasy (Britney Spears)|100",
  "caballero|CK One|100",
  "caballero|Man In Black|100",
  "caballero|212 Men NYC (Metalica)|100",
  "caballero|Valentino Uomo Born In Roma|100",
  "arabe|Al Haramain Amber Oud (Estuche)|120",
  "arabe|Afeef (Lujo)|100",
  "arabe|Nitro Red|100",
  "arabe|Hawas Ice|100",
]);

function idFor(categoria, nombre, talla, index) {
  return createHash("sha1")
    .update(`${categoria}|${nombre}|${talla ?? "x"}|${index}`)
    .digest("hex")
    .slice(0, 12);
}

const raw = JSON.parse(await readFile(sourcePath, "utf8"));
const now = new Date().toISOString();
const grouped = { dama: [], caballero: [], arabe: [] };

for (const item of raw) {
  grouped[item.categoria].push(item);
}

for (const categoria of ["dama", "caballero", "arabe"]) {
  grouped[categoria].push({
    nombre: "Perfumero de viaje",
    categoria,
    subcategoria: categoria === "arabe" ? "unisex" : undefined,
    talla_ml: null,
    precio: 3500,
    notas: [],
  });
}

const products = [];
let index = 0;
for (const categoria of ["dama", "caballero", "arabe"]) {
  for (const item of grouped[categoria]) {
    const talla = item.talla_ml ?? null;
    const key = `${categoria}|${item.nombre}|${talla ?? "x"}`;
    products.push({
      id: idFor(categoria, item.nombre, talla, index),
      nombre: item.nombre,
      categoria,
      subcategoria: categoria === "arabe" ? item.subcategoria || "unisex" : null,
      talla_ml: talla,
      precio: item.precio,
      precio_promocion: null,
      notas: [...new Set((item.notas || []).map((note) => String(note).trim().toLowerCase()).filter(Boolean))],
      imagen_url: "",
      video_url: "",
      disponible: true,
      destacado: destacados.has(`${categoria}|${item.nombre}|${talla ?? "x"}`),
      created_at: now,
      updated_at: now,
    });
    index += 1;
  }
}

const settings = {
  promoActiva: true,
  promoTexto: "-50% SIN COMPRA MÍNIMA",
  promoSubtitulo: "La mujer solo tiene un defecto: no reconoce lo valiosa que es",
  whatsapp: "",
  instagram: "",
  sitio: "",
  horario: "Lunes a sábado · 9:00 a.m. – 6:00 p.m.",
  cobertura: "Envíos a toda Colombia",
};

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "products.json"), JSON.stringify(products, null, 2));
await writeFile(path.join(dataDir, "settings.json"), JSON.stringify(settings, null, 2));
console.log(`Catálogo listo: ${products.length} productos.`);
