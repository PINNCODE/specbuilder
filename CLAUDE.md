# Spec Builder

Transforms non-technical entrepreneurs' ideas into complete, development-ready technical specs — bridging the gap between product vision and technical execution.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Next.js API Routes |
| LLM | Anthropic SDK → MiniMax |
| Deployment | Vercel |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│  │   Landing   │   │  Spec Form   │   │  Spec Viewer    │   │
│  │     /       │   │  /builder    │   │  /spec/[id]     │   │
│  └─────────────┘   └─────────────┘   └─────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /api/generate
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Route (Next.js)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              /app/api/generate/route.ts              │    │
│  │  1. Validate input                                    │    │
│  │  2. Build prompt from template                        │    │
│  │  3. Call Anthropic SDK → MiniMax                      │    │
│  │  4. Parse + structure LLM response                    │    │
│  │  5. Return JSON spec                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │ Anthropic SDK
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│  │   MiniMax   │   │  Vercel KV  │   │  PDF export     │   │
│  │    (LLM)    │   │  (storage)  │   │ (client-side)   │   │
│  └─────────────┘   └─────────────┘   └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with spec example and call-to-action |
| `/builder` | Input form + generation |
| `/spec/[id]` | Spec viewer with export/edit options |

## API Route: `POST /api/generate`

```
Input: { description, platform, features, integrations }
                │
                ▼
        ┌───────────────┐
        │   Validate    │ ── Si falla ──▶ 400 + mensaje
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │ Build prompt  │ ── Template de spec + user input
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │  Call LLM      │ ── Anthropic SDK
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │ Parse response │ ── JSON schema validation
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │ Return spec   │ 200 + JSON / 500 + error
        └───────────────┘
```

**Generated spec sections:**
1. Product overview
2. Prioritized features
3. Main user flows
4. Data models
5. API endpoints
6. Recommended tech stack
7. Terms glossary

## Data Flow

```
Usuario              Frontend              API Route            MiniMax
   │                    │                    │                    │
   │── escribe idea ───▶ │                    │                    │
   │                    │                    │                    │
   │── click generar ──▶ │                    │                    │
   │                    │── POST /api/generate ──▶ │            │
   │                    │                    │── anthropic. ─────▶ │
   │                    │                    │    messages.       │
   │                    │                    │    create           │
   │                    │                    │ ◀─── response ───── │
   │                    │ ◀─── { spec } ──── │                    │
   │ ◀── mostrar spec ─│                    │                    │
```

## Persistence

| Type | Storage | TTL |
|------|---------|-----|
| Drafts | Vercel KV (Redis) | Auto-save every 30s |
| Completed specs | Vercel KV (Redis) | 30 days |
| PDF export | Client-side (`react-pdf` / `html2pdf.js`) | — |

## Environment Variables

```bash
ANTHROPIC_API_KEY    # Anthropic key (routes to MiniMax endpoint)
KV_REST_API_URL      # Vercel KV URL
KV_REST_API_TOKEN    # Vercel KV token
```

## Key Constraints

- **No authentication** — public access
- **No database** — Vercel KV for persistence only
- **Code in English** — all code, comments, variables