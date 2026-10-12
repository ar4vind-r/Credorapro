# CHANGELOG — Credora

All notable changes to the Credora project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-10-12

### Changed & Redesigned (Whole-Site Design System Alignment)
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
