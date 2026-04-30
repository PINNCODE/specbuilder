import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres un generador de especificaciones técnicas. Genera una especificación técnica completa para el producto descrito por el usuario.

Responde SOLO con JSON válido, sin markdown ni texto adicional. Estructura exacta requerida:
{
  "vision": "Descripción general del producto, problema que resuelve, propuesta de valor",
  "usuarios": { "profiles": ["perfil1", "perfil2"], "needs": ["necesidad1"], "frustrations": ["frustración1"] },
  "funcionalidades": [{ "name": "nombre", "description": "descripción", "priority": "high|medium|low", "complexity": "high|medium|low" }],
  "flujos": [{ "name": "nombre del flujo", "steps": ["paso1", "paso2", "paso3"] }],
  "arquitectura": { "frontend": "tecnología recomendada", "backend": "tecnología recomendada", "database": "tecnología recomendada", "infrastructure": "tecnología recomendada" },
  "dataModels": [{ "name": "nombre del modelo", "fields": [{ "name": "campo", "type": "tipo de dato" }] }],
  "apiEndpoints": [{ "method": "GET|POST|PUT|DELETE", "path": "/ruta", "description": "descripción del endpoint" }],
  "requisitos": { "functional": ["requisito1", "requisito2"], "nonFunctional": ["requisito1", "requisito2"] }
}`;

interface MiniMaxSpec {
  vision: string;
  usuarios: { profiles: string[]; needs: string[]; frustrations: string[] };
  funcionalidades: Array<{ name: string; description: string; priority: string; complexity: string }>;
  flujos: Array<{ name: string; steps: string[] }>;
  arquitectura: { frontend: string; backend: string; database: string; infrastructure: string };
  dataModels: Array<{ name: string; fields: Array<{ name: string; type: string }> }>;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  requisitos: { functional: string[]; nonFunctional: string[] };
}

interface SpecData {
  overview: string;
  features: Array<{ name: string; priority: string; complexity: string }>;
  userFlows: Array<{ name: string; steps: string[] }>;
  dataModels: Array<{ name: string; fields: Array<{ name: string; type: string }> }>;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  techStack: { frontend: string; backend: string; database: string; infrastructure: string };
  glossary: Array<{ term: string; definition: string }>;
}

function transformToFrontendSpec(raw: MiniMaxSpec): SpecData {
  const priorityMap: Record<string, string> = {
    high: "must-have",
    medium: "should-have",
    low: "nice-to-have",
  };

  return {
    overview: raw.vision,
    features: raw.funcionalidades.map((f) => ({
      name: f.name,
      priority: priorityMap[f.priority] || f.priority,
      complexity: f.complexity,
    })),
    userFlows: raw.flujos,
    dataModels: raw.dataModels || [],
    apiEndpoints: raw.apiEndpoints || [],
    techStack: raw.arquitectura,
    glossary: raw.usuarios.profiles.map((profile) => ({
      term: profile,
      definition: `Usuario objetivo: ${profile}`,
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters" },
        { status: 400 }
      );
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nProducto: ${description.trim()}`;

    const response = await fetch("https://api.minimax.io/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        max_tokens: 4096,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("MiniMax API error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to generate spec. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = (data.content || [])
      .filter((block: { type: string; text?: string }) => block.type === "text")
      .map((block: { text?: string }) => block.text || "")
      .join("");

    let rawSpec: MiniMaxSpec;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      rawSpec = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse LLM response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse generated spec. Please try again." },
        { status: 500 }
      );
    }

    const spec = transformToFrontendSpec(rawSpec);
    return NextResponse.json({ spec, id: crypto.randomUUID() });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate spec. Please try again." },
      { status: 500 }
    );
  }
}
