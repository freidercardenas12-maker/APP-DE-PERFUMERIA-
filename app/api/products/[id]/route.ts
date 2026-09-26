import { getSession } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/store";
import { parseProductInput } from "@/lib/validate";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await context.params;
  const products = await getProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index < 0) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });

  const parsed = parseProductInput(await request.json().catch(() => null), products[index]);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const updated = {
    ...products[index],
    ...parsed.product,
    updated_at: new Date().toISOString(),
  };
  products[index] = updated;
  await saveProducts(products);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await context.params;
  const products = await getProducts();
  const next = products.filter((product) => product.id !== id);
  if (next.length === products.length) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  await saveProducts(next);
  return NextResponse.json({ ok: true });
}
