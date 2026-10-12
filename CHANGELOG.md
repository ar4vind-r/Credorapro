# CHANGELOG — Credora

All notable changes to the Credora project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-10-12

### Added
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
  - Upgraded `src/components/VerificationModal.tsx` to a mobile-first (360–430px) inspection view presenting:
    1. Status banner first (emerald for verified, red for revoked, rose for not found, amber for network error/notice).
    2. Recipient name in large bold type.
    3. Certificate number with copy button.
    4. Published credential details, issuing authority, and issue date.
  - Implemented all 6 core verification result states:
    - **Found, Valid:** "Certificate verified" with official stamp and published details.
    - **Revoked:** "Certificate revoked" with explicit revocation reason and crossed-out recipient name.
    - **Not Found:** "No certificate with this number exists" with manual number re-entry (never displays green).
    - **Network Error:** "Status could not be checked" with error details and a "Retry Verification" button.
    - **Loading:** Multi-element shimmer skeleton loader.
    - **Unverified Fallback:** Displays "Details read from QR code — not independently verified" without using the words "authentic" or "verified" when no database is configured.
- **Main Site Verification Entry Points:**
  - Added "VERIFY CERT #" button to top brutalist header in `src/components/Header.tsx`.
  - Added dedicated "VERIFY BY CERTIFICATE NUMBER" card on main upload step in `src/components/UploadStep.tsx` for damaged or printed certificates.
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
