# Credora Flow Spec Audit (AUDIT.md)

This audit evaluates the implemented Credora web application against the approved flow specifications in `flow-specs/` ([01-bulk-create-certificates.md](flow-specs/01-bulk-create-certificates.md) and [02-verify-certificate.md](flow-specs/02-verify-certificate.md)).

Every interaction step and edge case is evaluated and classified into one of three statuses:
- **Deliberate:** The build deliberately improved upon the spec to fulfill architectural requirements, cryptographic security, or user accessibility (kept and documented in spec).
- **Drift:** An unintentional mismatch or omission between specification and code (remediated immediately).
- **Not Prototyped:** A functional gap deferred or excluded with justification.

---

## Audit Matrix

| Spec Step | Expected | Actual | Classification | Action |
|:---|:---|:---|:---|:---|
| **FS01: Entry Points** | User enters via direct start or demo prompt ("Load Sample Data"). | Both entry points available; "Load Sample" button loads demo template + spreadsheet with 3 sample attendees. | **Deliberate** | Keep. Spec reflects current entry point. |
| **FS01: Step 1 (Upload)** | Dual intake zones for template and spreadsheet; auto-detection of dimensions and rows. | Dual dropzones with drag-and-drop, 0-byte detection, local PDF rasterization, and spreadsheet parsing. Added expected columns reference card and downloadable sample CSV. | **Deliberate** | Keep. Enhances onboarding clarity without altering flow altitude. |
| **FS01: Step 1 (Parsing Loading)** *(Edge Case 2)* | Inline progress indicator while reading large spreadsheets or rasterizing document pages. | Initial build parsed files asynchronously without a visual loading state inside dropzones. | **Drift** | **Fixed**: Added `isParsingTemplate` and `isParsingSpreadsheet` states with animated spinners and status copy inside dropzones. |
| **FS01: Step 2 (Review Data)** | Preview table of parsed rows/columns, name column selector, row search filter. | Tabular preview displaying first 20 records, name column dropdown selector, live search filter, and dominant progression action with attendee count. | **Deliberate** | Keep. Matches spec expectations with clear visual hierarchy. |
| **FS01: Step 3 (Field Positioning)** | Canvas preview with draggable/nudgeable field overlays, live row 1 data, real-time coordinate badge. | Full canvas preview with mouse/touch drag, keyboard arrow nudging (0.2% fine, 1.0% coarse), on-screen 4-direction buttons, and active coordinate tag (`{label} ({x}%, {y}%)`). | **Deliberate** | Keep. Parity between spec and implementation confirmed. |
| **FS01: Step 4 (Event Text & QR)** | Field palette to add custom text, event description presets, and authenticity QR code overlay. | Palette supports custom text, preset paragraphs, and QR code overlay. Also automatically generates non-sequential `CRD-YYYY-NNNNNN` certificate numbers printed under QR code. Added per-field privacy toggle. | **Deliberate** | Keep. Prompt 8 required cryptographic IDs, short URL encoding, and privacy toggles. Update spec Step 4. |
| **FS01: Step 5 (Typography & Switcher)** | Typography controls (font, size, weight, align, casing) and attendee row switcher. | Full typography inspector (Cinzel, Playfair, Great Vibes, Montserrat, etc.), alignment buttons, casing buttons, color picker, and attendee row switcher with next/previous and dropdown. | **Deliberate** | Keep. Matches spec with added letter spacing and hex color input. |
| **FS01: Step 6 (Export Settings & Render)** | Format options (PDF/image), filename pattern, total count on button, sequential rendering with progress indicator. | Format selection (PDF, PNG, JPG), filename pattern (`{{name}}_Certificate`), quality selector, dominant "Generate N Certificates" button, progress bar with current recipient name. Added live cancellation button and row-level error isolation. | **Deliberate** | Keep. Added chunked processing, cancellation, and failed row reporting for 500+ row resilience. Update spec Step 6. |
| **FS01: Step 7 (Download Archive)** | Success confirmation, thumbnail preview cards, full ZIP archive download. | "Batch Completed Successfully" callout, full ZIP download, individual file download buttons, zoom inspection modal, and regenerate action. | **Deliberate** | Keep. Complete parity with spec. |
| **FS01: Edge Cases (Batch Previews)** | Partial thumbnail preview for large batches exceeding memory thresholds. | Handled via `MAX_PREVIEW_ITEMS`: certificates beyond threshold display fallback card to conserve browser RAM. | **Deliberate** | Keep. Fully implemented in generator and export step. |
| **FS01: Returning User Workflow** | Returning users can save/load mapping configurations to skip manual repositioning. | "Save" and "Load" layout buttons in top toolbar download and import `credora_mapping_config.json`. | **Deliberate** | Keep. Fully implemented and functional. |
| **FS02: Entry Points** | Camera QR scan, direct link, export card "Verify" action. | All three entry points functional. Added a 4th entry point: manual "Verify by Certificate Number" search input on header and upload screen for damaged/printed certificates. | **Deliberate** | Keep. Prompt 8 mandated manual certificate number lookup. Update spec Entry Points. |
| **FS02: Step 1 (URL Parameters)** | Application URL containing certificate identifier and recipient name. | Application URL contains ONLY `?verify=CERT_ID`. Recipient name is omitted from URL to eliminate URL tampering and forgery. | **Deliberate** | Keep. Prompt 8 mandated registry lookup instead of trusting URL parameters. Update spec Step 1. |
| **FS02: Step 2 (Verification Details)** | Authenticity banner, verified recipient name, issuing organization, security stamp, trust seal. | Mobile-first modal (360–430px) querying cloud registry with 6 distinct states: Valid, Revoked (with reason), Not Found ("No certificate exists", never green), Network Error (with retry), Loading Skeleton, and Unverified Fallback. | **Deliberate** | Keep. Upgrades verification to tamper-proof database model with field privacy controls. Update spec Step 2. |
| **FS02: Step 3 (Dismissal)** | Prominent dismissal action, header close control, Escape key. | Header X button with `aria-label`, bottom "Close Window" button, Escape key listener, and backdrop click dismissal. | **Deliberate** | Keep. Matches spec with full accessibility support. |
| **FS02: Edge Cases (Not Found / Offline)** | Unrecognized certificate shows error status; offline scan shows offline messaging. | Invalid ID shows dedicated Not Found state with physical certificate typo guide; offline/network failure shows Network Error state with "Retry Verification" action. | **Deliberate** | Keep. Concrete actionable feedback for each error scenario. Update spec Edge Cases. |

---

## Summary of Changes

1. **Drift Items Remediated (1):**
   - **FS01 Step 1 (Parsing Loading):** Added `isParsingTemplate` and `isParsingSpreadsheet` state hooks to `src/components/UploadStep.tsx` rendering animated spinners and descriptive progress text while PDF pages are rasterized or Excel workbooks are decompressed.

2. **Deliberate Enhancements Documented in Specs (4):**
   - **FS01 Step 4:** Documented automatic cryptographic certificate number generation (`CRD-YYYY-NNNNNN`), sub-QR code printing, short URL encoding (`?verify=CERT_ID`), and per-field verification privacy toggles.
   - **FS01 Step 6:** Documented non-blocking chunked batch processing, live user cancellation (`Cancel Generation`), and row-level error isolation (`failedRows`).
   - **FS02 Entry Points:** Documented manual certificate number entry point from application header and upload screen.
   - **FS02 Step 1 & 2:** Documented cloud registry lookup replacing client-trusted URL parameters, and the 6 verification states (Valid, Revoked, Not Found, Network Error, Loading, Unverified Fallback).
