import { perfilAroma } from "@/lib/aroma";
import type { Producto } from "@/lib/types";

export type Buscable = Pick<Producto, "id" | "nombre" | "categoria" | "talla_ml" | "notas"> & {
  subcategoria?: Producto["subcategoria"] | null;
};

export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function distance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) grid[i][0] = i;
  for (let j = 0; j < cols; j += 1) grid[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(grid[i - 1][j] + 1, grid[i][j - 1] + 1, grid[i - 1][j - 1] + cost);
    }
  }
  return grid[left.length][right.length];
}

function isSubsequence(query: string, word: string): boolean {
  let index = 0;
  for (const letter of word) {
    if (letter === query[index]) index += 1;
    if (index === query.length) return true;
  }
  return false;
}

function score(item: Buscable, query: string): number {
  const name = fold(item.nombre);
  const notes = fold(item.notas.join(" "));
  const aroma = fold(perfilAroma(item).frase);
  const hay = `${name} ${notes} ${aroma}`;
  if (!query) return 0;
  if (name === query) return 1000;
  if (name.startsWith(query)) return 860;
  if (name.includes(query)) return 720;
  if (notes.includes(query)) return 640;
  if (aroma.includes(query)) return 560;

  const words = query.split(" ").filter(Boolean);
  if (words.length > 1 && words.every((word) => hay.includes(word))) return 600;

  const nameWords = name.split(" ").filter((word) => word.length >= 4);
  if (query.length >= 4 && nameWords.some((word) => distance(query, word) <= 1)) return 480;

  const compact = query.replace(/ /g, "");
  if (compact.length >= 3 && nameWords.some((word) => compact.length >= Math.ceil(word.length * 0.45) && isSubsequence(compact, word))) {
    return 360;
  }

  if (query.length <= 2 && hay.includes(query)) return 300;
  return 0;
}

export function buscarPerfumes<T extends Buscable>(items: T[], raw: string): T[] {
  const query = fold(raw);
  if (!query) return [];
  return items
    .map((item) => ({ item, score: score(item, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.nombre.localeCompare(b.item.nombre, "es"))
    .map((row) => row.item);
}
