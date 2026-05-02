"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";

interface Spec {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
}

export default function DownloadPdfButton({ spec }: { spec: Spec }) {
  const [loading, setLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setLoading(true);
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Spec</h1>
          <p style="color: #666; margin-bottom: 32px; font-size: 12px;">Generated ${new Date().toLocaleDateString()}</p>

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Visión</h2>
          <p style="line-height: 1.6; margin-bottom: 24px;">${spec.vision}</p>

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Usuarios</h2>
          <p style="line-height: 1.6; margin-bottom: 24px;">${spec.users}</p>

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Funcionalidades</h2>
          <ol style="line-height: 1.8; padding-left: 20px;">${spec.features.map((f) => `<li>${f}</li>`).join("")}</ol>

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Flujos</h2>
          ${spec.flows.map((flow) => `
            <div style="margin-bottom: 20px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
              <strong>${flow.name}</strong>
              <ol style="margin: 12px 0; padding-left: 20px; line-height: 1.8;">${flow.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
              <p style="color: #c00; font-size: 13px; margin-top: 8px;"><strong>Error:</strong> ${flow.error_path}</p>
            </div>
          `).join("")}

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Arquitectura</h2>
          <p style="line-height: 1.6; margin-bottom: 24px;">${spec.architecture}</p>

          <h2 style="font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">Requisitos</h2>
          <p style="line-height: 1.6;">${spec.requirements}</p>
        </div>
      `;

      const container = document.createElement("div");
      container.innerHTML = htmlContent;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().from(container.querySelector("div")!).set({
        filename: `spec-${Date.now()}.pdf`,
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).save();

      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-[var(--secondary)] hover:bg-[var(--accent)] transition border border-[var(--border)] disabled:opacity-50"
    >
      <FileText className="w-5 h-5" />
      <span>{loading ? "Generando..." : "Descargar .pdf"}</span>
    </button>
  );
}