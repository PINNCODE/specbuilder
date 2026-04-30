"use client";

import { useState } from "react";
import SpecOutput from "@/components/SpecOutput";

interface Spec {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
}

export default function BuilderPage() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);

  const handleGenerate = async () => {
    if (description.trim().length < 20) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate spec");
      }

      const data = await response.json();
      setSpec(data.spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Spec Builder</h1>
          <p className="text-zinc-400">Transforma tu idea en una especificacion tecnica lista para desarrollo</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-xl">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isGenerating}
            placeholder="describe tu idea de producto... por ejemplo: una app para que freelancers gestionen sus facturas"
            className="w-full h-48 p-4 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none text-white placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || description.trim().length < 20}
            className="w-full mt-4 bg-white text-black py-3 rounded-xl font-semibold hover:bg-zinc-200 transition disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                generando
              </>
            ) : (
              "generar especificacion"
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-xl text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {spec && <SpecOutput spec={spec} />}
      </div>
    </main>
  );
}