# CHANGELOG — Credora

All notable changes to the Credora project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-10-12

### Deployment & Submission Readiness
- **Comprehensive Project README:** Created exhaustive `README.md` documenting Credora's purpose, local-first privacy architecture, precision canvas tooling, cryptographic ID format (`CRD-YYYY-NNNNNN`), cloud registry setup, step-by-step user guide, automated tests, and known limitations.
- **3-Minute Walkthrough Script:** Created `DEMO_SCRIPT.md` with a rehearsed cue-by-cue script covering sample load, canvas nudging, chunked export, QR mobile verification, and fake ID fraud detection.
- **Environment & Secrets Audit:** Standardized `.env.example` with dummy values for `VITE_APP_URL` and Firebase credentials. Verified that `.env` is excluded via `.gitignore` and no API keys or secrets are committed.
- **Vercel & Netlify Deployment Configurations:** Added `vercel.json` and `netlify.toml` with Single-Page Application (SPA) fallback rewrites and static asset caching so deep verification routes (`/?verify=ID`) reload cleanly.
- **Dynamic Deployed Origin Parity:** Updated `src/utils/generator.ts` to respect `VITE_APP_URL` with dynamic fallback to `window.location.origin`, ensuring QR code destinations always match the deployed production origin.
- **Final Health Check:** `npm run build` compiled cleanly with 0 TypeScript errors; `npm test` executed 13/13 passing unit tests in < 100ms.

### Audited & Aligned with Flow Specs (AUDIT.md)
- **Flow Spec Audit Execution:**
  - Audited every user step and edge case across `flow-specs/01-bulk-create-certificates.md` and `flow-specs/02-verify-certificate.md` against the live React implementation.
  - Generated `AUDIT.md` comprehensive matrix classifying steps as Deliberate, Drift, or Not Prototyped.
- **Drift Remediated:**
  - **FS01 Edge Case 2 (File Parsing Loading):** Added `isParsingTemplate` and `isParsingSpreadsheet` loading states to `src/components/UploadStep.tsx`, displaying animated spinners and descriptive progress text during PDF page rasterization and Excel workbook extraction.
- **Deliberate Architectural Enhancements Synchronized in Specs:**
  - **FS01 Step 4:** Documented cryptographic non-sequential certificate numbers (`CRD-YYYY-NNNNNN`), sub-QR code printing, tamper-resistant short URL encoding, and per-field privacy toggles.
  - **FS01 Step 6:** Documented non-blocking chunked batch processing, live user cancellation, and row-level error isolation.
  - **FS02 Entry Points:** Documented manual certificate number entry point from application header and home screen.
  - **FS02 Step 1 & 2:** Documented cloud registry verification replacing client URL trust, with 6 verification states (Valid, Revoked, Not Found, Network Error, Loading, Unverified Fallback).
- **Validation:** Clean pass with 0 issues on `node validate-flow-specs.js flow-specs/`.

### Added & Hardened (Application Hardening & Testing)
- **Input Robustness:**
  - Handled 0-byte template and spreadsheet uploads with clear, actionable error messaging.
  - Enforced UTF-8 encoding in CSV parsing (`papaparse`) and lazy-loaded Excel parsing (`xlsx`).
  - Created pure validation utility `src/utils/spreadsheet.ts` with auto-detection of name column variants and automatic pruning of blank rows.
  - Granular row-specific error reporting: identifies exact 1-indexed row number if recipient name is missing (`"Row 14 has no recipient name under 'Name'. Fix it in your spreadsheet and re-upload."`).
  - Duplicate recipient name handling: detects duplicates, logs non-fatal warning, and prevents filename collisions by appending unique certificate IDs.
  - Text overflow prevention: added dynamic font auto-scaling and multi-line wrapping in `src/utils/generator.ts` ensuring long names never overflow bounding boxes or collide with QR / Cert No elements.
  - Unicode / Non-Latin character rendering: added fallback font stacks (`Noto Sans`, `Segoe UI`, `system-ui`) to guarantee crisp rasterization of Malayalam, Hindi, Arabic, Japanese, and Chinese glyphs.
- **Bulk Generation Resilience & Responsiveness:**
  - Chunked event-loop processing: yielded to browser execution loop every 4 rows (`setTimeout(0)`), keeping UI responsive for 500+ rows.
  - Live progress & cancellation: added live row counter with cancellation button (`Cancel Generation`) allowing users to halt generation without losing processed records.
  - Row-level fault isolation: errors on individual records are logged to `failedRows` rather than failing the whole batch.
  - Memory leak prevention: explicitly reset canvas dimensions (`width=0`, `height=0`) and revoked object URLs after rendering.
- **Error Handling & Error Boundaries:**
  - Implemented `src/components/ErrorBoundary.tsx` wrapping the application root with a brutalist recovery interface ("Reload Application", "Reset Workspace Session").
  - Removed raw uncaught exceptions and blank screens across all user flows.
- **Accessibility (WCAG AA):**
  - Added `role="status"` and `aria-live="polite"` to announce live progress to screen readers.
  - Configured `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` on `VerificationModal`.
  - Added explicit `<label htmlFor=...>` and `aria-label` bindings across search inputs and action buttons.
  - Verified visible focus rings (`focus-visible:ring-2 focus-visible:ring-yellow-400`) and keyboard completion for both red routes.
- **Performance & Lazy Loading:**
  - Lazy-loaded `jspdf`, `jszip`, `xlsx`, and `canvas-confetti` on-demand via dynamic `import()`.
  - Reduced initial bundle from **2,101.04 kB** (gzip: 649.97 kB) to **1,271.51 kB** (gzip: 377.82 kB) — **~40% initial load size reduction**.
- **Automated Testing & Collision-Free IDs:**
  - Upgraded `src/utils/certId.ts` using full-period coprime bijection (Hull-Dobell theorem), mathematically guaranteeing 0 collisions across 1,000,000+ IDs.
  - Implemented 13 unit tests via Node's native test runner (`node --test`) in `tests/certId.test.ts` and `tests/spreadsheet.test.ts`.
  - Added Playwright end-to-end test specification in `tests/e2e.spec.ts` covering Red Routes 1 and 2.

- **Visual Effects & Clutter Removal:**
  - Removed gratuitous gradients, heavy shadows (`box-shadow: 4px 4px 0px 0px`), glassmorphism (`backdrop-blur-*`), and decorative animations across all screens.
  - Retained functional motion strictly where it communicates state (progress spinner and linear progress bar during bulk batch rendering).
  - Streamlined container hierarchy: replaced nested boxes and excessive borders with strong typography (font size, font weight) and structured whitespace.
- **Primary Actions with Dominant Verb Labels:**
  - **Upload Screen:** Replaced generic submission button with dominant verb label: `"Continue to Map Fields ({count} Attendees)"`, with clear explanatory disabled states when files are missing.
  - **Mapping Studio Screen:** Updated primary navigation action to `"Continue to Export ({count} Certificates)"` with keyboard accelerator support (`Ctrl+Enter`).
  - **Export Screen:** Updated primary batch trigger to `"Generate {count} Certificates"` and post-generation action to `"Download ZIP Archive ({count} Files)"`.
  - **Flow Progress:** Redesigned multi-step stepper in `src/components/Header.tsx` displaying accessible progression (`Step 1 of 3: Upload Files`, `Step 2 of 3: Map Fields`, `Step 3 of 3: Export ZIP`) with past-step completion marks.
- **Granular, Useful Content & Actionable Error Reporting:**
  - Added **Expected Spreadsheet Columns Guide** on `src/components/UploadStep.tsx` detailing required (`Name`) and optional (`Course`, `Date`, `Role`, `Grade`) fields.
  - Added one-click **"Download Sample CSV Template"** utility generating an immediate reference CSV file.
  - Replaced generic spreadsheet errors with row-specific actionable reporting: `"Row {N} has no recipient name under '{column}'. Fix it in your spreadsheet and re-upload."`
  - In `src/components/VerificationModal.tsx`, added explicit sections for **"What this confirms"** and **"What to do next"** tailored to Valid, Revoked, Not Found, Network Error, and Unverified Fallback states.
- **Mobile Responsiveness & Touch Target Compliance:**
  - Verified and ensured all buttons, inputs, dropdowns, and interactive dropzones meet the WCAG minimum **44px touch target** standard (`min-h-[44px]`).
  - Tested layout across 360px, 390px, 768px, and 1280px viewports with zero horizontal scrolling.
  - Refactored `src/index.css` to use centralized design-system tokens (`.btn-primary`, `.btn-secondary`, `.brutal-card`, `--bg-main`, `--text-main`, `--border-color`).

### Added (Previous Verification Engine Upgrade)
- **Certificate Verification & Cloud Registry System:**
  - Added `firebase` SDK dependency to connect to cloud database registry for independent certificate validation.
  - Added `.env.example` and `.env` containing Firestore configuration parameters (`VITE_FIREBASE_*`).
  - Created `src/utils/certId.ts` generating non-sequential, tamper-proof certificate identifiers in `CRD-YYYY-NNNNNN` format with 4 random entropy characters and a 2-character deterministic checksum.
  - Created `src/services/firebase.ts` providing resilient lazy initialization of Firebase Firestore.
  - Created `src/services/registry.ts` supporting `publishCertificate`, `batchPublishCertificates` (chunked batch commits), and `lookupCertificate` (exact ID lookup with public read rules).
  - Created `VERIFICATION.md` detailing architecture, cryptographic identifier structure, database schema, Firestore security rules (read by exact `cert_id` only, no list scraping), and data flow.
- **Privacy Controls:**
  - Added `showOnVerification` boolean to `FieldMapping` in `src/types/index.ts`.
  - Added interactive "SHOW ON VERIFY PAGE" toggle in `src/components/MappingStudioStep.tsx` property inspector.
  - Added smart default privacy rules: enabled for name, course/event, date, certificate number; disabled for email, phone, contact, address, SSN, Aadhar.
- **Verification UI & Result States:**
  - Upgraded `src/components/VerificationModal.tsx` to a mobile-first (360–430px) inspection view.
  - Implemented all 6 core verification result states: Valid, Revoked (with reason), Not Found (explicit non-green error), Network Error (with retry), Loading Skeleton, and Unverified Fallback.
- **QR Code & Template Generator:**
  - Updated `src/utils/generator.ts` to encode strictly short URLs (`origin + '/?verify=' + certId`) with zero recipient parameters to prevent forgery.
  - Rendered small certificate number text directly beneath the QR code canvas.
  - Added `certificate_no` field support to visual canvas and jsPDF exports.
  - Included certificate number in exported filenames.
- **User Flow Specs:**
  - Cloned User Flow Specs skill into `.agent/skills/user-flow-specs`.
  - Created `REQUIREMENTS.md` at the project root defining R1 through R17.
  - Created `flow-specs/SCREENS.md`, `flow-specs/01-bulk-create-certificates.md`, `flow-specs/02-verify-certificate.md`, and `flow-specs/README.md`.
  - Added `validate-flow-specs.js` at project root with ESM compatibility (clean pass).
