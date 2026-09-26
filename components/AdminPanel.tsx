"use client";

import { formatCOP, formatTalla } from "@/lib/format";
import type { Ajustes, Categoria, Producto, Subcategoria } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Draft = {
  id?: string;
  nombre: string;
  categoria: Categoria;
  subcategoria: Subcategoria | "";
  talla_ml: string;
  precio: string;
  precio_promocion: string;
  notas: string;
  imagen_url: string;
  video_url: string;
  disponible: boolean;
  destacado: boolean;
};

const EMPTY: Draft = {
  nombre: "",
  categoria: "dama",
  subcategoria: "",
  talla_ml: "100",
  precio: "",
  precio_promocion: "",
  notas: "",
  imagen_url: "",
  video_url: "",
  disponible: true,
  destacado: false,
};

function toDraft(product: Producto): Draft {
  return {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    subcategoria: product.subcategoria || "",
    talla_ml: product.talla_ml == null ? "" : String(product.talla_ml),
    precio: String(product.precio),
    precio_promocion: product.precio_promocion == null ? "" : String(product.precio_promocion),
    notas: product.notas.join(", "),
    imagen_url: product.imagen_url,
    video_url: product.video_url,
    disponible: product.disponible,
    destacado: product.destacado,
  };
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error || "No se pudo guardar.";
}

export function AdminPanel({
  initialProducts,
  initialSettings,
}: {
  initialProducts: Producto[];
  initialSettings: Ajustes;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"productos" | "ajustes">("productos");
  const [products, setProducts] = useState(initialProducts);
  const [settings, setSettings] = useState(initialSettings);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Producto | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products.filter((product) => !text || product.nombre.toLowerCase().includes(text));
  }, [products, query]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function saveProduct() {
    if (!draft) return;
    setSaving(true);
    setError("");
    let imagen_url = draft.imagen_url;
    if (file) {
      const body = new FormData();
      body.set("file", file);
      const upload = await fetch("/api/upload", { method: "POST", body });
      if (!upload.ok) {
        setError(await readError(upload));
        setSaving(false);
        return;
      }
      const uploaded = (await upload.json()) as { url: string };
      imagen_url = uploaded.url;
    }
    const payload = {
      ...draft,
      imagen_url,
      talla_ml: draft.talla_ml,
      precio: draft.precio,
      precio_promocion: draft.precio_promocion,
      subcategoria: draft.categoria === "arabe" ? draft.subcategoria : "",
    };
    const response = await fetch(draft.id ? `/api/products/${draft.id}` : "/api/products", {
      method: draft.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    const saved = (await response.json()) as Producto;
    setProducts((current) => {
      const index = current.findIndex((product) => product.id === saved.id);
      if (index < 0) return [...current, saved];
      const next = [...current];
      next[index] = saved;
      return next;
    });
    setDraft(null);
    setFile(null);
    setMessage("Producto guardado.");
    router.refresh();
  }

  async function removeProduct() {
    if (!pendingDelete) return;
    setSaving(true);
    const response = await fetch(`/api/products/${pendingDelete.id}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setProducts((current) => current.filter((product) => product.id !== pendingDelete.id));
    setPendingDelete(null);
    setMessage("Producto eliminado.");
    router.refresh();
  }

  async function patchProduct(product: Producto, patch: Partial<Producto>) {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, ...patch, notas: product.notas }),
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    const saved = (await response.json()) as Producto;
    setProducts((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    router.refresh();
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setSettings((await response.json()) as Ajustes);
    setMessage("Ajustes guardados.");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-[#d4af37] uppercase">Administración</p>
          <h1 className="font-serif text-4xl">Aura & Essentia</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={logout}>
          Salir
        </button>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" className={tab === "productos" ? "btn-gold" : "btn-ghost"} onClick={() => setTab("productos")}>
          Productos
        </button>
        <button type="button" className={tab === "ajustes" ? "btn-gold" : "btn-ghost"} onClick={() => setTab("ajustes")}>
          Ajustes
        </button>
      </div>
      {message ? <p className="mt-4 text-sm text-[#e8d5a3]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {tab === "ajustes" ? (
        <form onSubmit={saveSettings} className="mt-6 grid gap-4 border border-[rgba(212,175,55,0.2)] p-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={settings.promoActiva}
              onChange={(event) => setSettings({ ...settings, promoActiva: event.target.checked })}
            />
            Mostrar banner de promoción en el inicio
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Texto de la promo
            <input value={settings.promoTexto} onChange={(event) => setSettings({ ...settings, promoTexto: event.target.value })} className="field mt-2" />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Subtítulo
            <input value={settings.promoSubtitulo} onChange={(event) => setSettings({ ...settings, promoSubtitulo: event.target.value })} className="field mt-2" />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            WhatsApp de pedidos
            <input
              value={settings.whatsapp}
              onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })}
              placeholder="573001112233"
              className="field mt-2"
            />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Correo
            <input
              type="email"
              value={settings.correo}
              onChange={(event) => setSettings({ ...settings, correo: event.target.value })}
              placeholder="correo@gmail.com"
              className="field mt-2"
            />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Instagram
            <input value={settings.instagram} onChange={(event) => setSettings({ ...settings, instagram: event.target.value })} placeholder="https://instagram.com/..." className="field mt-2" />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Horario
            <input value={settings.horario} onChange={(event) => setSettings({ ...settings, horario: event.target.value })} className="field mt-2" />
          </label>
          <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
            Cobertura
            <input value={settings.cobertura} onChange={(event) => setSettings({ ...settings, cobertura: event.target.value })} className="field mt-2" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-gold" disabled={saving}>
              Guardar cambios
            </button>
            <p className="mt-3 text-sm text-[#f6f1e7]/60">
              El número va con indicativo de país y sin signos. Ejemplo Colombia: 573001112233.
            </p>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                setDraft(EMPTY);
                setFile(null);
                setError("");
              }}
            >
              Nuevo producto
            </button>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar"
              aria-label="Buscar producto"
              className="field max-w-sm"
            />
            <span className="text-sm text-[#f6f1e7]/60">{visible.length} productos</span>
          </div>
          <div className="mt-4 overflow-x-auto border border-[rgba(212,175,55,0.2)]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-[0.68rem] tracking-[0.14em] text-[#d4af37] uppercase">
                <tr>
                  <th className="px-3 py-3 font-medium">Nombre</th>
                  <th className="px-3 py-3 font-medium">Categ.</th>
                  <th className="px-3 py-3 font-medium">Talla</th>
                  <th className="px-3 py-3 font-medium">Precio</th>
                  <th className="px-3 py-3 font-medium">Disp.</th>
                  <th className="px-3 py-3 font-medium">Dest.</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id} className="border-t border-[rgba(212,175,55,0.12)]">
                    <td className="px-3 py-3">{product.nombre}</td>
                    <td className="px-3 py-3 capitalize">{product.categoria}</td>
                    <td className="px-3 py-3">{formatTalla(product.talla_ml)}</td>
                    <td className="px-3 py-3">{formatCOP(product.precio)}</td>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={product.disponible}
                        aria-label={`Disponible ${product.nombre}`}
                        onChange={(event) => patchProduct(product, { disponible: event.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={product.destacado}
                        aria-label={`Destacado ${product.nombre}`}
                        onChange={(event) => patchProduct(product, { destacado: event.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button type="button" className="mr-3 text-[#e8d5a3] underline" onClick={() => { setDraft(toDraft(product)); setFile(null); }}>
                        Editar
                      </button>
                      <button type="button" className="text-red-300 underline" onClick={() => setPendingDelete(product)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {draft ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 md:place-items-center">
          <form
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-[rgba(212,175,55,0.35)] bg-[#101010] p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void saveProduct();
            }}
          >
            <h2 className="font-serif text-3xl">{draft.id ? "Editar producto" : "Nuevo producto"}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase md:col-span-2">
                Nombre
                <input value={draft.nombre} onChange={(event) => setDraft({ ...draft, nombre: event.target.value })} className="field mt-2" required />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Categoría
                <select
                  value={draft.categoria}
                  onChange={(event) => setDraft({ ...draft, categoria: event.target.value as Categoria })}
                  className="field mt-2"
                >
                  <option value="dama">Dama</option>
                  <option value="caballero">Caballero</option>
                  <option value="arabe">Árabe</option>
                </select>
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Subcategoría
                <select
                  value={draft.subcategoria}
                  onChange={(event) => setDraft({ ...draft, subcategoria: event.target.value as Subcategoria | "" })}
                  className="field mt-2"
                  disabled={draft.categoria !== "arabe"}
                >
                  <option value="">—</option>
                  <option value="dama">Dama</option>
                  <option value="caballero">Caballero</option>
                  <option value="unisex">Unisex</option>
                </select>
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Talla (ml)
                <input value={draft.talla_ml} onChange={(event) => setDraft({ ...draft, talla_ml: event.target.value })} className="field mt-2" placeholder="Vacío si es accesorio" />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Precio
                <input value={draft.precio} onChange={(event) => setDraft({ ...draft, precio: event.target.value })} className="field mt-2" required />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Precio promoción
                <input value={draft.precio_promocion} onChange={(event) => setDraft({ ...draft, precio_promocion: event.target.value })} className="field mt-2" placeholder="Opcional" />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
                Video URL
                <input value={draft.video_url} onChange={(event) => setDraft({ ...draft, video_url: event.target.value })} className="field mt-2" />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase md:col-span-2">
                Notas
                <input value={draft.notas} onChange={(event) => setDraft({ ...draft, notas: event.target.value })} className="field mt-2" placeholder="amaderado, dulce, cítrico" />
              </label>
              <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase md:col-span-2">
                Imagen
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
              </label>
              {draft.imagen_url ? <p className="text-xs text-[#f6f1e7]/50 md:col-span-2">Foto actual: {draft.imagen_url}</p> : null}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.disponible} onChange={(event) => setDraft({ ...draft, disponible: event.target.checked })} />
                Disponible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.destacado} onChange={(event) => setDraft({ ...draft, destacado: event.target.checked })} />
                Destacado
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" className="btn-gold" disabled={saving}>
                Guardar cambios
              </button>
              <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md border border-[rgba(212,175,55,0.35)] bg-[#101010] p-5">
            <h2 className="font-serif text-3xl">Borrar producto</h2>
            <p className="mt-3 text-sm leading-6 text-[#f6f1e7]/75">
              Se va a eliminar {pendingDelete.nombre}. Esta acción no se deshace.
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" className="btn-gold" disabled={saving} onClick={() => void removeProduct()}>
                Sí, borrar
              </button>
              <button type="button" className="btn-ghost" onClick={() => setPendingDelete(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
