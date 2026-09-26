import { waLink } from "@/lib/format";
import { getSettings } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para pedidos al por mayor de perfumes equivalencia en Colombia.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const href = settings.whatsapp
    ? waLink(settings.whatsapp, "Hola! Quiero información sobre los perfumes al por mayor.")
    : "";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-xs tracking-[0.22em] text-[#d4af37] uppercase">Nosotros</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Contacto</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[#f6f1e7]/75">
          Aura & Essentia vende y revende perfumes equivalencia calidad 1.1. El pedido se confirma por
          WhatsApp, igual que en el catálogo que ya compartes.
        </p>
        <dl className="mt-8 space-y-4 text-sm">
          {settings.correo ? (
            <div>
              <dt className="text-xs tracking-[0.16em] text-[#d4af37] uppercase">Correo</dt>
              <dd className="mt-1">
                <a href={`mailto:${settings.correo}`} className="text-[#e8d5a3]">
                  {settings.correo}
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs tracking-[0.16em] text-[#d4af37] uppercase">Horario</dt>
            <dd className="mt-1">{settings.horario}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-[#d4af37] uppercase">Cobertura</dt>
            <dd className="mt-1">{settings.cobertura}</dd>
          </div>
          {settings.sitio ? (
            <div>
              <dt className="text-xs tracking-[0.16em] text-[#d4af37] uppercase">Sitio</dt>
              <dd className="mt-1">{settings.sitio}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <div className="border border-[rgba(212,175,55,0.22)] p-6">
        <h2 className="font-serif text-3xl">Escríbenos</h2>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="btn-gold mt-6">
            Abrir WhatsApp
          </a>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[#f6f1e7]/70">
            El número de WhatsApp se configura en el panel de administración, en Ajustes.
          </p>
        )}
        {settings.correo ? (
          <a href={`mailto:${settings.correo}`} className="btn-ghost mt-3">
            Escribir al correo
          </a>
        ) : null}
        {settings.instagram ? (
          <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn-ghost mt-3">
            Instagram
          </a>
        ) : null}
      </div>
    </div>
  );
}
