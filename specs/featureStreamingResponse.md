# Minispec: Streaming de respuesta en Spec Builder

## 1. Qué hace

- El texto de la spec aparece token a token en el frontend mientras MiniMax lo genera
- Usa Server-Sent Events (SSE) entre la API route y el cliente
- El JSON final se valida y parsea al terminar el stream para garantizar estructura correcta
- Los botones de exportar (Markdown/PDF) funcionan sobre el spec parseado final

## 2. Por qué

El usuario hojea la spec conforme se genera, percibiendo progreso en lugar de espera. No cambia la velocidad real — solo la percepción. El flujo actual (respuesta completa de golpe) se siente como "pantalla congelada".

## 3. Criterios de aceptación

- [ ] API route acepta header `Accept: text/event-stream` y devuelve `Content-Type: text/event-stream`
- [ ] La API route hace streaming del texto de cada chunk recibido de MiniMax usando SSE
- [ ] El frontend usa `fetch` con `ReadableStream` para consumir el SSE y renderizar token a token
- [ ] Al recibir evento `data: [DONE]`, el frontend valida y parsea el JSON acumulado
- [ ] Si el parseo falla, se muestra mensaje de error con opción de reintentar (no stream incompleto)
- [ ] Los botones de exportar Markdown y PDF reciben el spec ya parseado (comportamiento idéntico al actual)
- [ ] El timeout de 30s y abort signal se mantienen
- [ ] Rate limiting y headers de seguridad se mantienen iguales

## 4. No incluye

- Cambiar el modelo MiniMax ni la lógica de prompt/validación
- Streaming del PDF (sigue siendo generación client-side post-completion)
- Guardar drafts parciales durante el stream
- Modificar la estructura del JSON del spec ni los campos de SpecOutput
- Cambiar el diseño visual de SpecOutput (el streaming solo cambia cómo llega el contenido)