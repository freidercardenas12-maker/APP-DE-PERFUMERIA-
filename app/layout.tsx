import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getProducts, getSettings } from "@/lib/store";
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Aura & Essentia",
    template: "%s | Aura & Essentia",
  },
  description:
    "Aura & Essentia. Perfumes equivalencia calidad 1.1 al por mayor y al detal en Colombia. Los mejores precios. Catálogo de dama, caballero y árabe, con pedido por WhatsApp.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${cormorant.variable} font-sans antialiased`}>
        <CartProvider>
          <div className="site-shell flex min-h-screen flex-col">
            <Header catalogo={products} />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} />
          </div>
          <WhatsAppFloat phone={settings.whatsapp} />
        </CartProvider>
      </body>
    </html>
  );
}
