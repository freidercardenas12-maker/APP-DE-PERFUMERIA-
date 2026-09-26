const CADA_MS = 8 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV !== "production") return;

  const base = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
  if (!base) return;

  const marca = globalThis as typeof globalThis & { __auraDespierto?: boolean };
  if (marca.__auraDespierto) return;
  marca.__auraDespierto = true;

  const url = `${base}/api/ping`;
  const avisar = () => {
    fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20_000) }).catch(() => {});
  };

  setTimeout(avisar, 20_000);
  setInterval(avisar, CADA_MS);
}
