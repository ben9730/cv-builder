---
status: awaiting_human_verify
trigger: "PDF upload/import feature works locally but fails with errors after deploying to Vercel"
created: 2026-03-02T00:00:00Z
updated: 2026-03-02T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - pdfjs-dist fake worker does a dynamic import("./pdf.worker.mjs") using a relative path that fails in Vercel serverless
test: trace through pdfjs v5 source code to understand exactly how Node.js path works
expecting: fix by pre-importing worker file so globalThis.pdfjsWorker is set before getDocument is called
next_action: apply fix to route.ts - import pdf.worker.mjs before calling getDocument

## Symptoms

expected: PDF should be parsed, text extracted, and resume sections populated (import flow)
actual: Error message is shown when trying to upload/import a PDF
errors: User reports errors appear but hasn't shared specific messages yet - likely "Failed to parse PDF" (500 response)
reproduction: Upload a PDF file on the Vercel-deployed version of the app
started: After deploying to Vercel - works fine on local dev server

## Eliminated

- hypothesis: pdfjs-dist not configured as serverExternalPackage
  evidence: next.config.ts already has serverExternalPackages: ['pdfjs-dist']
  timestamp: 2026-03-02

- hypothesis: problem is in the client-side import component
  evidence: PDF parsing is done in a server-side API route at /api/parse, not client-side
  timestamp: 2026-03-02

## Evidence

- timestamp: 2026-03-02
  checked: pdfjs-dist v5.4.624 source - legacy/build/pdf.mjs, static PDFWorker class initializer
  found: In Node.js, pdfjs sets `static #isWorkerDisabled = true` and `GlobalWorkerOptions.workerSrc ||= "./pdf.worker.mjs"` (relative path only)
  implication: The ||= means workerSrc is set to relative path only if not already set. Route never sets it, so it defaults to "./pdf.worker.mjs"

- timestamp: 2026-03-02
  checked: PDFWorker._setupFakeWorkerGlobal getter in pdfjs
  found: In Node.js it calls `await import(this.workerSrc)` where workerSrc = "./pdf.worker.mjs"
  implication: This dynamic import of a relative path will fail in Vercel's serverless environment where the working directory is unpredictable and the worker file is not guaranteed to be adjacent

- timestamp: 2026-03-02
  checked: pdf.worker.mjs file ending
  found: Worker sets `globalThis.pdfjsWorker = { WorkerMessageHandler }` when imported, AND exports WorkerMessageHandler
  implication: If we import the worker file BEFORE calling getDocument, the #mainThreadWorkerMessageHandler getter returns it, skipping the problematic dynamic import entirely

- timestamp: 2026-03-02
  checked: route.ts extractPdfText function
  found: No GlobalWorkerOptions.workerSrc is set anywhere before pdfjsLib.getDocument() is called
  implication: The relative workerSrc default is used, causing the serverless failure

- timestamp: 2026-03-02
  checked: next.config.ts
  found: Only has serverExternalPackages: ['pdfjs-dist'] - no webpack config, no alias for worker
  implication: pdfjs is not bundled, loaded from node_modules as-is. This is correct but incomplete - still needs worker configured

## Resolution

root_cause: The /api/parse route imports pdfjs-dist but never configures GlobalWorkerOptions.workerSrc. In Node.js (Vercel serverless), pdfjs uses a "fake worker" that does `await import("./pdf.worker.mjs")` with a relative path. This relative dynamic import fails in Vercel's serverless environment where the working directory is not the pdfjs package directory.
fix: Import the pdfjs worker file explicitly at the top of the route using `await import('pdfjs-dist/legacy/build/pdf.worker.mjs')`. This import sets `globalThis.pdfjsWorker` which pdfjs checks FIRST in _setupFakeWorkerGlobal, bypassing the problematic relative import entirely.
verification:
files_changed:
  - src/app/api/parse/route.ts
