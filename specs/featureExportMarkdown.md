# Feature: Export Spec as Markdown

**Que hace:**
Botón "Download MD" en `/spec/[id]` que genera y descarga un archivo `.md` con la spec completa formateada en Markdown.

**Porque:**
- Portabilidad: usuarios pueden guardar, compartir o versionar la spec en Git (README, repo docs)
- Independizrse del browser/app para acceder a la spec
- Base para futuras exportaciones (PDF via md→pdf, docx via md→docx)

**Criterios de aceptación:**
- [ ] Botón "Download Markdown" visible en Spec Viewer
- [ ] Archivo generado incluye todos los secciones: product overview, features, user flows, data models, API endpoints, tech stack, glossary
- [ ] Markdown válido con headers (`#`, `##`), listas (`-`), code blocks (`` ` ``), y negritas (`**`)
- [ ] Nombre del archivo: `spec-{id}-{timestamp}.md`
- [ ] Trigger: `Blob` + `URL.createObjectURL` + `click()` en `<a>` (client-side, sin backend)
- [ ] Fallback si JS deshabilitado: botón inactivo con tooltip

**No incluye:**
- Export a PDF/DOCX/HTML (existe `html2pdf.js` o es scope diferente)
- Preview del Markdown antes de descargar
- Guardado automático a la nube (Vercel KV ya existe para persistence)
- Stitching de múltiples specs en un solo archivo
