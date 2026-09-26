import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Entrar al panel", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <img src="/logo.jpg" alt="Aura & Essentia" className="mx-auto h-auto w-full max-w-sm" />
      <h1 className="sr-only">Aura & Essentia</h1>
      <LoginForm />
    </div>
  );
}
