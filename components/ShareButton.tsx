"use client";

import { useState } from "react";

export function ShareButton({
  label,
  title,
  text,
  className = "btn-ghost",
}: {
  label: string;
  title: string;
  text: string;
  className?: string;
}) {
  const [aviso, setAviso] = useState("");

  async function compartir() {
    const url = window.location.href;
    const mensaje = `${text}\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(mensaje);
      setAviso("Link copiado. Pégalo en tu historia o en el chat.");
    } catch {
      setAviso(url);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" className={className} onClick={compartir}>
        {label}
      </button>
      {aviso ? <span className="text-xs tracking-normal text-[#e8d5a3] normal-case">{aviso}</span> : null}
    </span>
  );
}
