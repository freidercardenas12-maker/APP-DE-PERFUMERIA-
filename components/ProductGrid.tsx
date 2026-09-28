import { ProductCard } from "@/components/ProductCard";
import type { Producto } from "@/lib/types";

export function ProductGrid({ products, whatsapp = "" }: { products: Producto[]; whatsapp?: string }) {
  if (products.length === 0) {
    return (
      <p className="border border-dashed border-[rgba(212,175,55,0.35)] px-6 py-16 text-center text-[#f6f1e7]/70">
        No hay productos con esos filtros. Prueba otro nombre, nota o rango de precio.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} whatsapp={whatsapp} />
      ))}
    </div>
  );
}
