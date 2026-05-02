# Plan: Mejorar UX del streaming de spec

## Contexto

Actualmente el streaming muestra el texto plano en un `<pre>` monospace — funciona pero se siente como un terminal. La spec completa tiene estructura (vision, users, features, flows, etc) y debería reflejar eso conforme aparece.

## Enfoque

En lugar de un `<pre>` genérico, crear un componente `<StreamingOutput>` que:
- Renderiza cada sección de la spec con su header/icono correspondiente
- Solo muestra secciones que ya tienen contenido
- Los textos aparecen token a token dentro de cada sección
- Mantiene consistencia visual con `SpecOutput` (mismos estilos de headers, badges, etc)
- Al completarse, reemplaza el streaming output con el `<SpecOutput>` real (comportamiento actual)

## Archivos a modificar

1. `src/components/StreamingOutput.tsx` — nuevo componente
2. `src/app/builder/page.tsx` — usar `StreamingOutput` durante generación

## Criterios de aceptación

- [ ] Headers de sección visibles desde el primer chunk de cada sección
- [ ] El contenido de cada sección aparece progresivamente
- [ ] Iconos y estilo visual consistente con `SpecOutput`
- [ ] Al completarse, se transiciona a `SpecOutput` con los datos parseados
- [ ] Exports (Markdown, PDF) funcionan igual — operan sobre el spec final, no el stream

## No incluye

- Cambios en `SpecOutput` — sigue funcionando igual
- Streaming del PDF — sigue siendo post-completion
- Cambios en la lógica de parsing o validación