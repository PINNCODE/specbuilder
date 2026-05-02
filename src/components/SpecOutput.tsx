"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Lightbulb,
  Users,
  Zap,
  Workflow,
  Building2,
  FileCheck,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

const DownloadPdfButton = dynamic(() => import("./DownloadPdfButton"), { ssr: false });

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
  onNewSpec?: () => void;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ icon, title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 mb-4 group"
      >
        <span className="text-[var(--foreground)]">{icon}</span>
        <h2 className="text-lg font-bold text-[var(--foreground)] flex-1 text-left">{title}</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
        )}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function SpecOutput({ spec, onNewSpec }: SpecOutputProps) {
  const [copied, setCopied] = useState(false);

  const formatSpecAsMarkdown = () => {
    return `# Visión

${spec.vision}

# Usuarios

${spec.users}

# Funcionalidades

${spec.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

# Flujos

${spec.flows.map((flow) => `## ${flow.name}

${flow.steps.map((s) => `- ${s}`).join("\n")}

**Error:** ${flow.error_path}`).join("\n\n")}

# Arquitectura

${spec.architecture}

# Requisitos

${spec.requirements}
`;
  };

  const handleDownloadMd = () => {
    const md = formatSpecAsMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spec-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <div className="animate-fade-in space-y-6 mt-8">
      {onNewSpec && (
        <div className="flex justify-end">
          <button
            onClick={onNewSpec}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva especificación
          </button>
        </div>
      )}

      <Section icon={<Lightbulb className="w-5 h-5" />} title="Visión">
        <p className="text-[var(--foreground)] text-lg leading-relaxed">{spec.vision}</p>
      </Section>

      <Section icon={<Users className="w-5 h-5" />} title="Usuarios">
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">{spec.users}</p>
        </div>
      </Section>

      <Section icon={<Zap className="w-5 h-5" />} title="Funcionalidades">
        <div className="grid gap-3">
          {spec.features.map((feature, index) => {
            const isUserCan = feature.startsWith("El usuario puede");
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-[var(--secondary)] rounded-xl"
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    isUserCan ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-[var(--foreground)]">{feature}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section icon={<Workflow className="w-5 h-5" />} title="Flujos">
        <div className="space-y-6">
          {spec.flows.map((flow, index) => (
            <div key={index} className="bg-[var(--secondary)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-medium">
                  Principal
                </span>
                <h3 className="font-semibold text-[var(--foreground)]">{flow.name}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {flow.steps.map((step, stepIndex) => (
                  <span key={stepIndex} className="flex items-center gap-2">
                    <span className="bg-[var(--muted)] text-[var(--foreground)] px-3 py-1 rounded-full text-sm">
                      {stepIndex + 1}. {step}
                    </span>
                    {stepIndex < flow.steps.length - 1 && (
                      <span className="text-[var(--muted-foreground)]">→</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                <span className="bg-red-900/50 text-red-400 text-xs px-2 py-1 rounded font-medium">
                  Error
                </span>
                <span className="text-[var(--muted-foreground)] text-sm">{flow.error_path}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Building2 className="w-5 h-5" />} title="Arquitectura">
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">{spec.architecture}</p>
        </div>
      </Section>

      <Section icon={<FileCheck className="w-5 h-5" />} title="Requisitos">
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">{spec.requirements}</p>
        </div>
      </Section>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-[var(--secondary)] hover:bg-[var(--accent)] transition border border-[var(--border)]"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copiar</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownloadMd}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-[var(--secondary)] hover:bg-[var(--accent)] transition border border-[var(--border)]"
        >
          <Download className="w-5 h-5" />
          <span>Descargar .md</span>
        </button>
        <DownloadPdfButton spec={spec} />
      </div>
    </div>
  );
}