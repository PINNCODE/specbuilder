"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Zap, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span className="text-xl font-bold">Spec Builder</span>
        </div>
        <ThemeToggle />
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary)] border border-[var(--border)] mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Transforma ideas en specs técnicas</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              De tu idea a una{" "}
              <span className="bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                especificación lista
              </span>{" "}
              para desarrollo
            </h1>

            <p className="text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl">
              Spec Builder transforma descripciones simples de productos en especificaciones
              técnicas completas con flujos de usuario, arquitectura y requisitos.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                Crear tu spec
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
              >
                Ver ejemplos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Cómo funciona</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Describe tu idea</h3>
              <p className="text-[var(--muted-foreground)]">
                Escribe en lenguaje natural qué quieres construir. No necesitas conocimientos técnicos.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. IA genera la spec</h3>
              <p className="text-[var(--muted-foreground)]">
                Nuestra IA transforma tu descripción en una especificación técnica completa y estructurada.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Lista para desarrollo</h3>
              <p className="text-[var(--muted-foreground)]">
                Obtén flujos de usuario, modelos de datos, arquitectura y requisitos en un formato listo para usar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[var(--border)] text-center text-[var(--muted-foreground)] text-sm">
        <p>Spec Builder — Transformando ideas en realidad</p>
      </footer>
    </main>
  );
}