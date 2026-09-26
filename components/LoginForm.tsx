"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "No se pudo entrar.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 grid max-w-md gap-4 border border-[rgba(212,175,55,0.25)] p-6">
      <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
        Usuario
        <input value={user} onChange={(event) => setUser(event.target.value)} className="field mt-2" autoComplete="username" required />
      </label>
      <label className="text-xs tracking-[0.14em] text-[#e8d5a3] uppercase">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field mt-2"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button type="submit" className="btn-gold" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
