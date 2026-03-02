/**
 * Type declaration for the pdfjs-dist worker module.
 *
 * The worker file has no bundled .d.ts. We import it as a side-effect
 * in the /api/parse route to pre-populate `globalThis.pdfjsWorker` so
 * that pdfjs-dist skips its broken relative `import("./pdf.worker.mjs")`
 * in Vercel's serverless environment.
 */
declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
  // Side-effect import only; no named exports used from application code.
}
