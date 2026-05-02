# Feature: Export Spec as PDF

## Context

The spec-builder app generates structured technical specs but only supports Markdown export. Users need a PDF export to share specs offline with stakeholders who prefer formatted documents.

## Qué hace

Adds a "Download PDF" button to the `SpecOutput` component that renders the spec as a formatted PDF file and triggers browser download.

**Existing asset:** `html2pdf.js` is already in `package.json` but unused.

## Por qué

- Users request portable, shareable documents for investor/team reviews
- PDF is a universal format that preserves formatting across devices
- html2pdf.js is client-side, no server cost, already available

## Criterios de aceptación

- [ ] `Download as PDF` button appears next to existing "Download Markdown" button in `SpecOutput`
- [ ] Clicking the button generates a PDF matching the Markdown export content/structure
- [ ] PDF filename follows pattern: `spec-{timestamp}.pdf`
- [ ] PDF renders Korean characters (via `html2pdf.js` + jsPDF)
- [ ] Button is disabled/hidden while spec is loading
- [ ] PDF layout: portrait, A4 size, adequate margins, readable font size
- [ ] Error toast if PDF generation fails (fallback to Markdown download)

## No incluye

- Server-side PDF generation (client-side only via html2pdf.js)
- Custom branding/logo in PDF
- PDF preview before download
- Batch export of multiple specs
- Email/auto-share of PDF

## Implementación sugerida

1. **File:** `src/components/SpecOutput.tsx`
2. **Pattern:** Reuse existing `handleDownloadMd` structure — add similar `handleDownloadPdf()` function
3. **Library:** `import html2pdf from 'html2pdf.js'` (already in dependencies)
4. **Content:** Convert spec sections to a formatted HTML template, pass to html2pdf.js

## Verificación

1. Run `npm run dev`
2. Go to `/builder`, submit a spec description
3. After spec renders, click "Download PDF" — file downloads
4. Open PDF, verify: content matches spec, Korean renders correctly, filename is `spec-{timestamp}.pdf`