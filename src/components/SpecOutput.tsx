"use client";

import { useState } from "react";

interface Flow {
  name: string;
  steps: string[];
  error_path: string;
}

interface Spec {
  vision: string;
  users: string;
  features: string[];
  flows: Flow[];
  architecture: string;
  requirements: string;
}

interface SpecOutputProps {
  spec: Spec;
}

export default function SpecOutput({ spec }: SpecOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `
VISION
${spec.vision}

USERS
${spec.users}

FEATURES
${spec.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

FLOWS
${spec.flows.map((flow, i) => `
${i + 1}. ${flow.name}
Steps: ${flow.steps.join(" → ")}
Error: ${flow.error_path}
`).join("")}

ARCHITECTURE
${spec.architecture}

REQUIREMENTS
${spec.requirements}
    `.trim();

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Vision - Hero Section */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-white">Vision</h2>
        </div>
        <p className="text-zinc-300 text-lg leading-relaxed">{spec.vision}</p>
      </div>

      {/* Users Section */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">👥</span>
          <h2 className="text-xl font-bold text-white">Usuarios</h2>
        </div>
        <div className="bg-zinc-800 rounded-xl p-6">
          <p className="text-zinc-300 leading-relaxed">{spec.users}</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚡</span>
          <h2 className="text-xl font-bold text-white">Funcionalidades</h2>
        </div>
        <div className="grid gap-3">
          {spec.features.map((feature, index) => {
            const isUserCan = feature.startsWith("El usuario puede");
            return (
              <div key={index} className="flex items-start gap-3 p-4 bg-zinc-800 rounded-xl">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  isUserCan ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                }`}>
                  {index + 1}
                </span>
                <span className="text-zinc-300">{feature}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flows Section */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔄</span>
          <h2 className="text-xl font-bold text-white">Flujos</h2>
        </div>
        <div className="space-y-6">
          {spec.flows.map((flow, index) => (
            <div key={index} className="bg-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-medium">
                  Principal
                </span>
                <h3 className="font-semibold text-white">{flow.name}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {flow.steps.map((step, stepIndex) => (
                  <span key={stepIndex} className="flex items-center gap-2">
                    <span className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {stepIndex + 1}. {step}
                    </span>
                    {stepIndex < flow.steps.length - 1 && (
                      <span className="text-zinc-500">→</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-700">
                <span className="bg-red-900/50 text-red-400 text-xs px-2 py-1 rounded font-medium">
                  Error
                </span>
                <span className="text-zinc-400 text-sm">{flow.error_path}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Section */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🏗️</span>
          <h2 className="text-xl font-bold text-white">Arquitectura</h2>
        </div>
        <div className="bg-zinc-800 rounded-xl p-6">
          <p className="text-zinc-300 leading-relaxed">{spec.architecture}</p>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-bold text-white">Requisitos</h2>
        </div>
        <div className="bg-zinc-800 rounded-xl p-6">
          <p className="text-zinc-300 leading-relaxed">{spec.requirements}</p>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-zinc-700"
      >
        {copied ? (
          <>
            <span>✓</span>
            Copiado al portapapeles
          </>
        ) : (
          <>
            <span>📋</span>
            Copiar especificacion completa
          </>
        )}
      </button>
    </div>
  );
}