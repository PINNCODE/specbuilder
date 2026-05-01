import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60000;
const MAX_REQUESTS = 10;

function getRateLimitInfo(ip: string) {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    const resetAt = now + WINDOW_MS;
    ipRequestMap.set(ip, { count: 1, resetAt });
    return { success: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  record.count++;
  const success = record.count <= MAX_REQUESTS;
  return { success, remaining: Math.max(0, MAX_REQUESTS - record.count), resetAt: record.resetAt };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://specbuilder.vercel.app",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

const inputSchema = z.object({
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description too long")
    .transform((val) => val.replace(/<[^>]*>/g, "").trim()),
});

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

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const { success } = getRateLimitInfo(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: corsHeaders }
      );
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nProducto: ${parsed.data.description}`;

    const response = await fetch("https://api.minimax.io/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        max_tokens: 4096,
        messages: [{ role: "user", content: fullPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate spec. Please try again." },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const responseText = (data.content || [])
      .filter((block: { type: string; text?: string }) => block.type === "text")
      .map((block: { text?: string }) => block.text || "")
      .join("");

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const parsedSpec = JSON.parse(cleanJson);

    const validatedSpec = specSchema.parse(parsedSpec);

    return NextResponse.json(
      { spec: validatedSpec, id: crypto.randomUUID() },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to generate spec. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}