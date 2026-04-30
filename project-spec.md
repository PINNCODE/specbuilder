# SPEC-FIRST: Spec Builder

## 1. Visión del producto

Spec Builder transforma las ideas de emprendedores no técnicos en especificaciones técnicas completas y listas para desarrollo, eliminando la barrera entre visión de producto y ejecución técnica.

---

## 2. Usuarios y casos de uso

### Usuario principal

Emprendedor no técnico con una idea de producto en etapas tempranas.

### Casos de uso

| # | Caso de uso | Descripción |
|---|-------------|-------------|
| 1 | **Documentar idea inicial** | Tiene una visión en mente y quiere plasmarla en un documento estructurado antes de olvidarla o perder claridad |
| 2 | **Obtener cotizaciones confiables** | Quiere compartir algo concreto con freelancers o agencias para comparar manzanas con manzanas |
| 3 | **Comunicarse con developers** | Necesita traducir su visión al lenguaje que un técnico entiende sin aprender a programar |
| 4 | **Preparar investor brief** | Quiere algo más sólido que slides informales para presentar a potenciales inversores |
| 5 | **Clarificar alcance** | Quiere definir scope y features antes de invertir tiempo o dinero |

---

## 3. Funcionalidades

### INPUT

**El usuario puede:**

- Ingresar una descripción breve de su idea de producto (textarea libre)
- Seleccionar el tipo de plataforma (web, mobile iOS, mobile Android, desktop, API, o combinación)
- Especificar si ya tiene dominio, hosting, o alguna infraestructura existente
- Indicar si ya tiene mockups o wireframes
- Marcar si la aplicación requiere autenticación de usuarios
- Marcar si necesita integraciones con servicios externos (payment, email, etc.)
- Definir nivel de prioridad por feature (must-have, nice-to-have)
- Guardar specs como borrador para continuar después
- Editar specs guardadas

**El sistema permite:**

- Validar que la descripción tenga suficiente información para generar una spec útil
- Sugerir prompts de clarificación si la descripción es demasiado vaga

---

### OUTPUT

**El usuario puede:**

- Visualizar la spec completa generada en tiempo real
- Descargar la spec como documento PDF
- Descargar la spec como archivo Markdown
- Copiar la spec al clipboard con un click
- Exportar a shareable link

**El sistema permite:**

- Generar una estructura de spec completa: overview, features, user flows, data models, API endpoints, tech stack, wireframes textuales
- Incluir estimaciones de complejidad por feature
- Generar glossary de términos técnicos derivados de la descripción

---

### ESTADOS

**El sistema permite:**

| Estado | Comportamiento |
|--------|-----------------|
| **Vacío** | Mostrar ejemplo de una spec completada para guiar al usuario |
| **Cargando** | Mostrar progreso de generación por sección |
| **Completo** | Mostrar spec con opciones de export/share/editar |
| **Error** | Mostrar mensaje claro con opción de reintentar |
| **Edición** | Permitir al usuario refinar secciones específicas post-generación |

---

## 4. Flujos de usuario

### Flujo principal

```
1. INICIO
   └─ Usuario abre la app y ve textarea vacío + ejemplo de spec como referencia visual

2. INPUT
   └─ Usuario completa descripción y marca opciones relevantes (plataforma, integraciones, etc.)

3. VALIDACIÓN
   └─ Sistema verifica que haya suficiente información
      └─ Si es muy vaga → pide clarificación con preguntas específicas

4. GENERACIÓN
   └─ Usuario hace click en "Generar Spec"
   └─ Sistema muestra progreso por sección:
      • Analizando descripción...
      • Definiendo features...
      • Diseñando data models...
      • Creando API endpoints...
      • Seleccionando tech stack...

5. RESULTADO
   └─ Spec completa se muestra con opciones de:
      • Exportar (PDF, Markdown, clipboard, link)
      • Editar secciones específicas
      • Regenerar una sección

6. EXPORTAR
   └─ Usuario descarga o comparte la spec
```

---

### Flujos de error

| Escenario | Comportamiento |
|-----------|-----------------|
| **LLM falla** | Mensaje: "No pudimos generar la spec. Reintenta en unos minutos." + botón reintentar. El usuario no pierde lo que escribió |
| **Descripción vaga** | Sistema marca qué partes necesitan más detalle y guía con preguntas. No falla silenciosamente |
| **Timeout parcial** | Muestra secciones completadas, marca cuáles fallaron. Usuario puede reintentar solo esas secciones |
| **Error de exportación** | Sugiere formato alternativo. Si todo falla, ofrece copiar al clipboard como fallback |
| **Sesión expira con borrador** | Auto-guarda cada 30s. Al volver, ofrece continuar desde donde quedó |

---

### Flujo alternativo: Regeneración

1. Usuario hace click en "Regenerar" en una sección específica (ej: data models)
2. Sistema regenera solo esa sección manteniendo el resto intacto
3. Usuario puede iterar sin rehacer todo

---

## 5. Arquitectura

### Stack tecnológico

| Capa | Tecnología |
|------|-------------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Next.js API Routes |
| LLM | Anthropic SDK → MiniMax |
| Deployment | Vercel |

---

### Diagrama de arquitectura

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

---

### Rutas del frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con ejemplo de spec y call-to-action |
| `/builder` | Formulario de entrada + generación |
| `/spec/[id]` | Viewer de spec con opciones de exportar/editar |

---

### API Route: `POST /api/generate`

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

**Prompt template — secciones generadas:**

1. Overview del producto
2. Features priorizadas
3. User flows principales
4. Data models
5. API endpoints
6. Tech stack recomendado
7. Glossary de términos

---

### Data flow

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

---

### Persistencia

| Tipo | Storage | TTL |
|------|---------|-----|
| Borradores | Vercel KV (Redis) | Auto-save cada 30s |
| Specs completadas | Vercel KV (Redis) | 30 días |
| Exportar PDF | Client-side (`react-pdf` / `html2pdf.js`) | — |

---

### Environment variables

```bash
ANTHROPIC_API_KEY    # Clave de Anthropic (apunta a endpoint MiniMax)
KV_REST_API_URL      # Vercel KV URL
KV_REST_API_TOKEN    # Vercel KV token
```

---

## 6. Requisitos no funcionales

### Rendimiento

| Métrica | Target |
|---------|--------|
| TTFB (páginas estáticas) | < 200ms |
| Generación de spec (< 500 palabras) | < 30s |
| Time-to-interactive (3G lento) | < 3s |
| Export PDF (client-side) | < 5s |
| Auto-guardado en KV | < 500ms, no bloqueante |

---

### Seguridad

- **Validación de input:** Todo user input se sanitiza antes de enviarse al LLM (prevenir prompt injection)
- **API keys:** Almacenadas en environment variables de Vercel, nunca exponidas al cliente
- **Rate limiting:** 10 requests/minuto por IP en `/api/generate`
- **CORS:** Solo el dominio de la app puede llamar a las API routes
- **Sin datos sensibles:** No se almacenan nombres, emails, ni información personal

---

### Accesibilidad

- **WCAG 2.1 nivel AA** como objetivo mínimo
- **Keyboard navigation:** Todo elemento interactivo accesible por teclado
- **Screen reader support:** Labels correctos, ARIA cuando corresponda
- **Contraste de color:** Ratio mínimo 4.5:1 para texto
- **Focus visible:** Indicación clara del elemento con foco

---

### Compatibilidad

- **Browsers:** Chrome, Firefox, Safari (últimas 2 versiones)
- **Responsive:** Mobile-first, funcional de 320px a 1920px+
- **Graceful degradation:** Contenido estático navegable si JS falla en load

---

## 7. FUERA DE ALCANCE

### Lo que NO vamos a construir

| Área | Excluido | Razón |
|------|----------|-------|
| Autenticación de usuarios | No hay login, signup, ni cuentas | MVP no lo requiere. Specs son link-shareables |
| Edición colaborativa | No hay multi-usuario por spec | Complexity fuera del MVP |
| Integración con project tools | No Jira, Notion, Trello, Linear | Premature. Se puede agregar después |
| Hosting de archivos | No storage de imágenes, PDFs subidos por usuario | MVP solo genera spec textual |
| Code generation | No generar código fuente, ni scaffolds | Diferente producto. Spec ≠ código |
| Legal docs | No ToS, Privacy Policy generator | Fuera del alcance de una spec técnica |
| AI fine-tuning | No entrenar ni ajustar el modelo | Usamos API estándar |
| Multi-idioma | Solo español inicialmente | Simplifica prompt engineering |
| Versionado de specs | No historial de cambios ni diffs | Borrador + spec final es suficiente |
| Comments en specs | No annotations ni feedback | Premature |
| Notificaciones | No emails, push, ni in-app alerts | Nada que notificar en MVP |
| Analytics avanzado | No dashboards ni tracking detallado | Google Analytics básico (pageviews) es suficiente |
| Admin panel | No panel de admin | Podemos agregar después si es necesario |
| API pública | No endpoints externos documentados | Solo internal API route |
| A/B testing | No feature flags ni experiments | Premature optimization |
| Dark mode | No theme toggle | Un tema (light) por ahora |

---

### Decisiones explícitas fuera del MVP

1. **No vamos a hacer un editor visual/wysiwyg** — La spec es textual estructurada, no un documento diseñable
2. **No vamos a hacer integración con Figma/Miro** — Los wireframes son textuales en el MVP
3. **No vamos a hacer generación de diagrams** — El output es texto y JSON, no SVGs
4. **No vamos a hacer team workspaces** — Una spec = un owner = link para compartir
5. **No vamos a hacer integraciones con payment providers** — Payment se documenta como requirement, no se integra