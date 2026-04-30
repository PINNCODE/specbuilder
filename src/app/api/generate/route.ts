import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a senior software architect. Your ONLY task is to generate technical specifications in JSON format.

Given the product idea provided by the user, generate a complete technical specification as a JSON object.

IMPORTANT: Respond with the raw JSON object directly — no wrapper keys, no markdown fences, no extra text.
The root object must have exactly these 6 keys:

{
  "vision": "<string, 2-4 sentences describing the product vision, core purpose, and value proposition>",
  "users": "<string, 2-4 sentences describing the target users, their context, and their main pain points>",
  "features": [
    "El usuario puede ... (or El sistema permite ...)",
    "... between 5 and 8 items total ..."
  ],
  "flows": [
    {
      "name": "<short flow name>",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "error_path": "<what happens if this flow fails>"
    }
  ],
  "architecture": "<string, 2-4 sentences describing the technical architecture, stack choices, and system design>",
  "requirements": "<string, 2-4 sentences covering the key functional and non-functional requirements>"
}

Rules:
- features: array of strings, 5–8 items, each starting with 'El usuario puede' or 'El sistema permite'.
- flows: array of objects, 3–5 items. Each object must have exactly: name (string), steps (array of strings with the happy-path steps in order), error_path (string describing what happens if the flow fails).
- vision, users, architecture, requirements: plain strings of exactly 2–4 sentences — not one line, not a long paragraph.
- Output only the JSON object. No wrapper object, no extra keys, no explanation.

IMPORTANT: Return the JSON object directly. Do NOT wrap it in any parent key like spec, data, result or any other wrapper. The root of your response must be the JSON object itself.`;

interface MiniMaxSpec {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
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

    return NextResponse.json({ spec: rawSpec, id: crypto.randomUUID() });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate spec. Please try again." },
      { status: 500 }
    );
  }
}
