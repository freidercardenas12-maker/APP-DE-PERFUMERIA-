import { Logo } from "@/components/Logo";
import { waLink } from "@/lib/format";
import type { Ajustes } from "@/lib/types";
import Link from "next/link";

export function Footer({ settings }: { settings: Ajustes }) {
  const whatsapp = settings.whatsapp
    ? waLink(settings.whatsapp, "Hola! Quiero información. Vi que tienen los mejores precios, al por mayor y al detal.")
    : "";

  return (
    <footer className="border-t border-[rgba(212,175,55,0.25)] bg-black">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#f6f1e7]/70">
            Perfumes equivalencia calidad 1.1, al por mayor y al detal. Los mejores precios. Dama, caballero y árabe / nicho.
          </p>
        </div>
        <div className="text-sm leading-7 text-[#f6f1e7]/75">
          <p className="font-serif text-xl text-[#e8d5a3]">Visítanos</p>
          <p>{settings.horario}</p>
          <p>{settings.cobertura}</p>
          {settings.correo ? (
            <p>
              <a href={`mailto:${settings.correo}`}>{settings.correo}</a>
            </p>
          ) : null}
          {settings.sitio ? <p>{settings.sitio}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-3 text-sm tracking-[0.14em] uppercase">
          <Link href="/catalogo/dama">Catálogo dama</Link>
          <Link href="/catalogo/caballero">Catálogo caballero</Link>
          <Link href="/catalogo/arabe">Catálogo árabe</Link>
          <Link href="/contacto">Contacto</Link>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
          {settings.instagram ? (
            <a href={settings.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          ) : null}
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs leading-5 text-[#f6f1e7]/45">
        Las fragancias de este catálogo son aromas equivalentes, inspirados en referencias conocidas. No son el
        producto original ni están afiliados a esas marcas. Conviene revisar precios y disponibilidad antes de
        publicar campañas.
      </p>
    </footer>
  );
}
