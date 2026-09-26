import { randomBytes } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { Ajustes, Producto } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const productsPath = path.join(dataDir, "products.json");
const settingsPath = path.join(dataDir, "settings.json");

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, value: unknown) {
  await mkdir(dataDir, { recursive: true });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, file);
}

export function getProducts() {
  return enqueue(() => readJson<Producto[]>(productsPath));
}

export function saveProducts(products: Producto[]) {
  return enqueue(() => writeJson(productsPath, products));
}

export async function getProduct(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}

export function getSettings() {
  return enqueue(() => readJson<Ajustes>(settingsPath));
}

export function saveSettings(settings: Ajustes) {
  return enqueue(() => writeJson(settingsPath, settings));
}
