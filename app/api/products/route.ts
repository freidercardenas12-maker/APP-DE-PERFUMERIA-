import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/store";
import { parseProductInput } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const parsed = parseProductInput(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const now = new Date().toISOString();
  const product = {
    ...parsed.product,
    id: randomBytes(6).toString("hex"),
    created_at: now,
    updated_at: now,
  };
  const products = await getProducts();
  products.push(product);
  await saveProducts(products);
  return NextResponse.json(product);
}
