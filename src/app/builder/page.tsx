"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import SpecOutput from "@/components/SpecOutput";
import StreamingOutput from "@/components/StreamingOutput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/components/Toaster";
import { Lightbulb, Loader2, X, Info, ChevronRight, Sparkles, Clock } from "lucide-react";
import HistoryPanel from "@/components/HistoryPanel";
import { saveSpec, SpecEntry } from "@/utils/storage";

interface Spec {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
}

const specSchema = z.object({
  vision: z.string(),
  users: z.string(),
  features: z.array(z.string()).min(5).max(8),
  flows: z
    .array(
      z.object({
        name: z.string(),
        steps: z.array(z.string()),
        error_path: z.string(),
      })
    )
    .min(3)
    .max(5),
  architecture: z.string(),
  requirements: z.string(),
});

const MIN_CHARS = 20;
const TIPS = [
  "Incluye el problema que resuelves y para quién",
  "Menciona las funcionalidades principales que necesitas",
  "Describe cualquier integración que tengas en mente",
  "Piensa en quién usará tu producto y qué necesitará",
];

export default function BuilderPage() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const specRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isGenerating && description.trim().length >= MIN_CHARS) {
          handleGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, description]);

  const handleGenerate = useCallback(async () => {
    if (description.trim().length < MIN_CHARS) return;

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setError(null);
    setSpec(null);
    setStreamingText("");
    setIsStreamingComplete(false);
    setShowStreaming(false);
    setGenerationStatus("Validando descripción...");

    try {
      setGenerationStatus("Generando especificación...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate spec");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            if (data.startsWith("[ERROR]")) {
              throw new Error(data.slice(7));
            }
            if (data.startsWith("[FINAL]")) {
              accumulated = decodeURIComponent(data.slice(7));
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamingText(accumulated);
                if (!showStreaming) setShowStreaming(true);
              }
            } catch {}
          }
        }
      }

      setGenerationStatus("Validando estructura...");
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : accumulated;
      const parsedSpec = JSON.parse(cleanJson);

      const validatedSpec = {
        vision: parsedSpec.vision,
        users: parsedSpec.users,
        features: parsedSpec.features,
        flows: parsedSpec.flows,
        architecture: parsedSpec.architecture,
        requirements: parsedSpec.requirements,
      };

      specSchema.parse(validatedSpec);
      setSpec(validatedSpec);
      saveSpec(validatedSpec, { description });
      setStreamingText("");
      setIsStreamingComplete(true);
      toast("Especificación generada exitosamente", "success");

      setTimeout(() => {
        specRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setStreamingText("");
      if (err instanceof Error && err.name === "AbortError") {
        setError("Generación cancelada");
        toast("Generación cancelada", "info");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
      setAbortController(null);
    }
  }, [description]);

  const handleCancel = () => {
    abortController?.abort();
  };

  const handleNewSpec = () => {
    setSpec(null);
    setDescription("");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadSpec = (entry: SpecEntry) => {
    setSpec(entry.spec);
    setDescription(entry.formData.description);
    setError(null);
    setIsHistoryOpen(false);
    setTimeout(() => {
      specRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const charCount = description.length;
  const isValid = charCount >= MIN_CHARS;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center justify-between p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-bold">Spec Builder</span>
        </div>
        <div className="flex items-center gap-4">
          {spec && (
            <button
              onClick={handleNewSpec}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Nueva spec
            </button>
          )}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            aria-label="Ver historial"
          >
            <Clock className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Spec Builder</h1>
          <p className="text-[var(--muted-foreground)]">
            Transforma tu idea en una especificación técnica lista para desarrollo
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-xl">
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200 font-medium mb-1">Tip</p>
              <p className="text-sm text-[var(--muted-foreground)] transition-all duration-300">
                {TIPS[currentTip]}
              </p>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isGenerating}
              placeholder="describe tu idea de producto... por ejemplo: una app para que freelancers gestionen sus facturas"
              className="w-full h-48 p-4 bg-[var(--secondary)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent resize-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span
                className={`text-xs ${
                  isValid ? "text-emerald-400" : "text-[var(--muted-foreground)]"
                }`}
              >
                {charCount}/{MIN_CHARS} min
              </span>
            </div>
          </div>

          {description.length > 0 && description.length < MIN_CHARS && (
            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Necesitas al menos {MIN_CHARS - description.length} caracteres más
            </p>
          )}

          <div className="mt-4 flex gap-3">
            {isGenerating ? (
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-red-500 text-red-400 hover:bg-red-500/10 transition"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!isValid}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Generar especificación
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {isGenerating && generationStatus && (
            <div className="mt-4 flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{generationStatus}</span>
            </div>
          )}

          {showStreaming && !spec && (
            <div ref={specRef}>
              <StreamingOutput accumulatedText={streamingText} isComplete={isStreamingComplete} />
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          <p className="mt-4 text-xs text-[var(--muted-foreground)] text-center">
            Presiona{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--secondary)] border border-[var(--border)] font-mono text-xs">
              Ctrl
            </kbd>
            {" + "}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--secondary)] border border-[var(--border)] font-mono text-xs">
              Enter
            </kbd>{" "}
            para generar
          </p>
        </div>

        {spec && (
          <div ref={specRef}>
            <SpecOutput spec={spec} onNewSpec={handleNewSpec} />
          </div>
        )}

        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onLoadSpec={handleLoadSpec}
        />
      </div>
    </main>
  );
}