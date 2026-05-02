"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  Users,
  Zap,
  Workflow,
  Building2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface StreamingOutputProps {
  accumulatedText: string;
  isComplete: boolean;
}

interface SectionState {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
}

const EMPTY_SECTIONS: SectionState = {
  vision: "",
  users: "",
  features: [],
  flows: [],
  architecture: "",
  requirements: "",
};

function StreamingSection({
  icon,
  title,
  children,
  isLoading,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[var(--foreground)]">{icon}</span>
        <h2 className="text-lg font-bold text-[var(--foreground)] flex-1">{title}</h2>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />}
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
        )}
      </div>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function StreamingOutput({ accumulatedText, isComplete }: StreamingOutputProps) {
  const [sections, setSections] = useState<SectionState>(EMPTY_SECTIONS);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    try {
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const cleanJson = jsonMatch[0];
      const parsed = JSON.parse(cleanJson);

      setSections({
        vision: parsed.vision || "",
        users: parsed.users || "",
        features: parsed.features || [],
        flows: parsed.flows || [],
        architecture: parsed.architecture || "",
        requirements: parsed.requirements || "",
      });

      if (parsed.vision !== undefined) setActiveSection("vision");
      if (parsed.users !== undefined) setActiveSection("users");
      if (parsed.features !== undefined) setActiveSection("features");
      if (parsed.flows !== undefined) setActiveSection("flows");
      if (parsed.architecture !== undefined) setActiveSection("architecture");
      if (parsed.requirements !== undefined) setActiveSection("requirements");
    } catch {
      // JSON not complete yet, ignore
    }
  }, [accumulatedText]);

  const hasContent = (text: string) => text && text.trim().length > 0;
  const hasFeatures = sections.features.length > 0;
  const hasFlows = sections.flows.length > 0;

  return (
    <div className="animate-fade-in space-y-6 mt-8">
      <StreamingSection
        icon={<Lightbulb className="w-5 h-5" />}
        title="Visión"
        isLoading={!hasContent(sections.vision)}
      >
        <p className="text-[var(--foreground)] text-lg leading-relaxed">
          {sections.vision || <span className="text-[var(--muted-foreground)] italic">Esperando contenido...</span>}
        </p>
      </StreamingSection>

      <StreamingSection
        icon={<Users className="w-5 h-5" />}
        title="Usuarios"
        isLoading={!hasContent(sections.users)}
      >
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">
            {sections.users || <span className="text-[var(--muted-foreground)] italic">Esperando contenido...</span>}
          </p>
        </div>
      </StreamingSection>

      <StreamingSection
        icon={<Zap className="w-5 h-5" />}
        title="Funcionalidades"
        isLoading={!hasFeatures}
      >
        <div className="grid gap-3">
          {hasFeatures ? (
            sections.features.map((feature, index) => {
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
            })
          ) : (
            <div className="text-[var(--muted-foreground)] italic p-4">Esperando funcionalidades...</div>
          )}
        </div>
      </StreamingSection>

      <StreamingSection
        icon={<Workflow className="w-5 h-5" />}
        title="Flujos"
        isLoading={!hasFlows}
      >
        <div className="space-y-6">
          {hasFlows ? (
            sections.flows.map((flow, index) => (
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
            ))
          ) : (
            <div className="text-[var(--muted-foreground)] italic p-4">Esperando flujos...</div>
          )}
        </div>
      </StreamingSection>

      <StreamingSection
        icon={<Building2 className="w-5 h-5" />}
        title="Arquitectura"
        isLoading={!hasContent(sections.architecture)}
      >
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">
            {sections.architecture || <span className="text-[var(--muted-foreground)] italic">Esperando contenido...</span>}
          </p>
        </div>
      </StreamingSection>

      <StreamingSection
        icon={<FileCheck className="w-5 h-5" />}
        title="Requisitos"
        isLoading={!hasContent(sections.requirements)}
      >
        <div className="bg-[var(--secondary)] rounded-xl p-6">
          <p className="text-[var(--foreground)] leading-relaxed">
            {sections.requirements || <span className="text-[var(--muted-foreground)] italic">Esperando contenido...</span>}
          </p>
        </div>
      </StreamingSection>

      {!isComplete && (
        <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generando especificación...</span>
        </div>
      )}
    </div>
  );
}