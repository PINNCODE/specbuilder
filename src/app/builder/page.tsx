"use client";

import { useState } from "react";

const PLATFORMS = ["Web", "Mobile iOS", "Mobile Android", "Desktop", "API", "Combination"];
const INTEGRATIONS = ["Payment (Stripe, PayPal)", "Email (SendGrid, Mailgun)", "SMS", "Social Auth", "Analytics", "Storage (S3)", "Other"];

interface SpecData {
  overview: string;
  features: Array<{ name: string; priority: string; complexity: string }>;
  userFlows: Array<{ name: string; steps: string[] }>;
  dataModels: Array<{ name: string; fields: Array<{ name: string; type: string }> }>;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  techStack: { frontend: string; backend: string; database: string; infrastructure: string };
  glossary: Array<{ term: string; definition: string }>;
}

export default function BuilderPage() {
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Web");
  const [hasInfrastructure, setHasInfrastructure] = useState(false);
  const [hasMockups, setHasMockups] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  const handleIntegrationToggle = (integration: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((i) => i !== integration)
        : [...prev, integration]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSpec(null);

    const steps = [
      "Analyzing description...",
      "Defining features...",
      "Designing data models...",
      "Creating API endpoints...",
      "Selecting tech stack...",
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setGenerationProgress(steps[stepIndex]);
        stepIndex++;
      }
    }, 600);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          platform,
          hasInfrastructure,
          hasMockups,
          needsAuth,
          integrations: selectedIntegrations,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress("");

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
    <main className="min-h-screen p-8 bg-black text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Spec</h1>
          <p className="text-gray-400">Describe your product idea and get a complete technical specification</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-8 mb-8 border border-zinc-800">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">Product Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product idea in detail. What does it do? Who is it for? What are the main features?"
              className="w-full h-40 p-4 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium mb-2 text-gray-300">Options</label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={hasInfrastructure}
                  onChange={(e) => setHasInfrastructure(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Has existing infrastructure (domain, hosting)</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={hasMockups}
                  onChange={(e) => setHasMockups(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Has mockups or wireframes</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={needsAuth}
                  onChange={(e) => setNeedsAuth(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Requires user authentication</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">Integrations Needed</label>
            <div className="flex flex-wrap gap-2">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration}
                  onClick={() => handleIntegrationToggle(integration)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedIntegrations.includes(integration)
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  {integration}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || description.length < 20}
            className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate Spec"}
          </button>

          {isGenerating && generationProgress && (
            <p className="text-center text-gray-400 mt-4">{generationProgress}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-300 p-4 rounded-lg mb-8">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {spec && <SpecViewer spec={spec} />}
      </div>
    </main>
  );
}

function SpecViewer({ spec }: { spec: SpecData }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Technical Spec</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition text-white">
            Copy to Clipboard
          </button>
          <button className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition text-white">
            Download PDF
          </button>
          <button className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition text-white">
            Download Markdown
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">Product Overview</h3>
          <p className="text-gray-300">{spec.overview}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">Prioritized Features</h3>
          <div className="space-y-2">
            {spec.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  feature.priority === "must-have" ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
                }`}>
                  {feature.priority}
                </span>
                <span className="font-medium text-white">{feature.name}</span>
                <span className="text-sm text-gray-500">Complexity: {feature.complexity}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">User Flows</h3>
          <div className="space-y-4">
            {spec.userFlows.map((flow, index) => (
              <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="font-medium mb-2 text-white">{flow.name}</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  {flow.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">Data Models</h3>
          <div className="space-y-4">
            {spec.dataModels.map((model, index) => (
              <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="font-medium mb-2 text-white">{model.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {model.fields.map((field, fieldIndex) => (
                    <span key={fieldIndex} className="px-2 py-1 bg-zinc-700 rounded text-sm font-mono text-gray-300">
                      {field.name}: {field.type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">API Endpoints</h3>
          <div className="space-y-2">
            {spec.apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg font-mono text-sm">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  endpoint.method === "GET" ? "bg-green-900 text-green-300" :
                  endpoint.method === "POST" ? "bg-blue-900 text-blue-300" :
                  endpoint.method === "PUT" ? "bg-yellow-900 text-yellow-300" :
                  "bg-red-900 text-red-300"
                }`}>
                  {endpoint.method}
                </span>
                <span className="flex-1 text-white">{endpoint.path}</span>
                <span className="text-gray-400">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">Recommended Tech Stack</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-800 rounded-lg">
              <span className="text-sm text-gray-500">Frontend</span>
              <p className="font-medium text-white">{spec.techStack.frontend}</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg">
              <span className="text-sm text-gray-500">Backend</span>
              <p className="font-medium text-white">{spec.techStack.backend}</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg">
              <span className="text-sm text-gray-500">Database</span>
              <p className="font-medium text-white">{spec.techStack.database}</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg">
              <span className="text-sm text-gray-500">Infrastructure</span>
              <p className="font-medium text-white">{spec.techStack.infrastructure}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-zinc-800">Terms Glossary</h3>
          <div className="space-y-2">
            {spec.glossary.map((item, index) => (
              <div key={index} className="p-3 bg-zinc-800 rounded-lg">
                <span className="font-medium text-blue-400">{item.term}</span>
                <span className="text-gray-400 ml-2">{item.definition}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}