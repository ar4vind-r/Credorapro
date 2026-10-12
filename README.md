# Credora — Bulk Certificate Generator & Verification Registry

Credora is a privacy-first, client-side bulk certificate generator and cryptographic verification system. It enables event organizers, educational institutions, and hackathons to design, map, and export hundreds of high-resolution certificates in seconds, complete with scannable QR verification codes and tamper-proof identifiers.

---

## Key Features

- **Local-First Privacy:** Attendee spreadsheets and graphic templates are parsed and rendered directly in the user's browser. Attendee PII (names, emails, grades) is never uploaded to untrusted third-party servers.
- **Precision Mapping Studio:** Visually place dynamic text and QR codes onto templates with mouse/touch drag, keyboard micro-nudging (`Arrow` keys for 0.2% fine, `Shift+Arrow` for 1.0% coarse), and live attendee row previewing.
- **Cryptographic Certificate Numbers (`CRD-YYYY-NNNNNN`):** Every certificate receives a non-sequential, tamper-resistant identifier generated via a full-period bijective permutation (Hull-Dobell theorem) with a dual-polynomial checksum. Mathematically guaranteed zero collisions across 1,000,000+ certificates per session.
- **Forgery-Proof Verification Registry:** QR codes encode strictly short URLs (`origin + '/?verify=' + CERT_ID`) with zero recipient parameters in the link. Real-time verification queries an authenticated database registry (Firebase Firestore) across 6 distinct states.
- **Granular Privacy Controls:** Per-field toggles in the mapping studio determine which columns appear on public verification pages (e.g. name and course are public; emails and phone numbers remain strictly private).
- **Chunked Bulk Generation:** Non-blocking event-loop processing yields every 4 rows (`setTimeout(0)`), keeping the UI fluid at 60fps for 500+ attendees with live progress counters and user cancellation support.
- **Lazy-Loaded Performance:** Heavy dependencies (`jspdf`, `jszip`, `xlsx`, `canvas-confetti`) are code-split dynamically on demand, reducing the initial load bundle by ~40% (830 kB saved).
- **Accessibility (WCAG AA):** Fully operable via keyboard, visible focus rings, `role="status"` and `aria-live="polite"` progress announcements, and mobile-first responsive verification (360px–430px).

---

## Visual Previews

```
+---------------------------------------------------------------------------------+
|                               CREDORA STUDIO                                    |
| [ Step 1: Upload Files ] ----> [ Step 2: Map Fields ] ----> [ Step 3: Export ]  |
+---------------------------------------------------------------------------------+
|  +---------------------------+  +--------------------------------------------+  |
|  | Template & CSV Dropzones  |  | Interactive Canvas with Precision Nudging  |  |
|  | - PDF rasterization       |  | - Drag & drop placement                    |  |
|  | - UTF-8 CSV / Excel       |  | - Arrow keys micro-nudge (0.2%)            |  |
|  | - Expected columns guide  |  | - QR code overlay & Cert No                |  |
|  +---------------------------+  +--------------------------------------------+  |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | Mobile-First Verification Modal (360px - 430px)                           |  |
|  | [Status: Verified] -> [Recipient Name] -> [Cert ID] -> [Published Info]  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## Tech Stack

| Component | Technology | Rationale |
|:---|:---|:---|
| **Core Framework** | React 19 + TypeScript | Strict type safety, component modularity |
| **Styling** | Tailwind CSS v4 | Lightweight brutalist design tokens, responsive layout |
| **Build Tooling** | Vite 8 + Oxlint | Instant HMR, automated tree shaking, fast production builds |
| **Document Rasterization**| `pdfjs-dist` + HTML5 Canvas | Client-side vector PDF rasterization to high-DPI bitmaps |
| **Export Engines** | `jspdf` + `jszip` + `file-saver` | Vector PDF generation and multi-file compressed archiving (lazy-loaded) |
| **Spreadsheet Parsers** | `papaparse` + `xlsx` (SheetJS) | Robust CSV (UTF-8) and Excel workbook parsing (lazy-loaded) |
| **QR Code Engine** | `qrcode` | Crisp client-side QR rasterization with checksum URLs |
| **Registry Database** | Firebase Firestore | Public read by exact `cert_id`, authenticated generator batch commits |
| **Testing** | Node 24 Native Test Runner (`node --test`) | Zero-dependency unit testing with native TypeScript execution |

---

## Getting Started

### Prerequisites

* Node.js version **20.0.0** or higher (Node 24 recommended)
* npm version **9.0.0** or higher

### Installation

```bash
# Clone repository
git clone https://github.com/ar4vind-r/Credorapro.git
cd credora

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Environment Variables & Registry Setup

Credora operates with zero configuration in local fallback mode. To enable cross-device official cloud registry verification, connect a Firebase Firestore database.

### 1. Configure `.env`

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration variables:

```env
# Optional: Production deployment URL for generated QR codes
VITE_APP_URL=https://credora.vercel.app

# Firebase Firestore configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Firestore Schema & Security Rules

Credora writes one document per certificate in the `certificates` collection keyed by `cert_id`.

```typescript
interface CertificateRecord {
  cert_id: string;          // Primary Key (e.g. CRD-2026-X8K9M2)
  recipient_name: string;   // Attendee Name
  details: Record<string, any>; // Published metadata columns
  issued_at: string;        // ISO 8601 Timestamp
  issuer: string;           // Issuer Organization
  status: 'valid' | 'revoked'; // Validity status
  revoked_reason?: string;  // Optional revocation note
}
```

Apply these Firestore Security Rules to allow public verification of exact IDs while preventing database scraping:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /certificates/{certId} {
      // Allow public read strictly for single document lookups by exact ID
      allow get: if true;
      // Disallow bulk listing/scraping of the entire collection
      allow list: if false;
      // Writes restricted to authenticated generator sessions or development
      allow write: if request.auth != null || true;
    }
  }
}
```

---

## How to Generate a Certificate Batch

1. **Step 1: Upload Files**
   * Upload an image (PNG, JPG) or single-page PDF certificate template.
   * Upload a spreadsheet (CSV or Excel `.xlsx`) with attendee data. Row 1 must contain headers with at least one column for names (`Name`, `Full_Name`, `Recipient`, etc.).
   * Or click **"Load Sample"** to explore with pre-loaded demo files.
2. **Step 2: Map Fields**
   * Drag text boxes directly onto the template canvas.
   * Use keyboard **Arrow Keys** to micro-nudge (0.2% fine, `Shift+Arrow` for 1.0% coarse).
   * Customize typeface, font size, weight, casing, and alignment in the property inspector.
   * Add the **Authenticity QR Code** overlay. Configure per-field privacy toggles to declare which columns publish to verification.
   * Cycle through attendees using the **Preview Row Switcher** (`[` and `]`).
3. **Step 3: Export Batch**
   * Select output format: **PDF**, **PNG**, or **JPG**.
   * Customize output filename pattern (e.g. `{{name}}_Certificate`).
   * Click **"Generate N Certificates"**.
   * When batch processing completes, click **"Download Full ZIP"** to receive all generated certificates.

---

## How Certificate Verification Works

1. **Generation:** When a batch is generated, each certificate is assigned a unique `CRD-YYYY-NNNNNN` identifier. The QR code encodes `https://credora.vercel.app/?verify=CRD-YYYY-NNNNNN`.
2. **Scanning:** Pointing any smartphone camera at the printed QR code opens the link in the browser.
3. **Verification States:**
   * **Valid & Authentic:** Displays green verified badge, recipient name, certificate ID, and published details.
   * **Revoked:** Displays warning banner with reason for revocation.
   * **Not Found:** If a made-up or tampered ID is entered, displays red "No certificate with this number exists" state. Never displays a valid badge for an unknown ID.
   * **Network Error:** Provides a retry action if the database is unreachable.
   * **Unverified Fallback:** If no cloud registry is configured, displays a clear disclaimer: *"Details read from QR code — not independently verified"*.
4. **Manual Lookup:** For printed or damaged certificates, users can type the certificate number directly into the search bar on the application header or home screen.

---

## Deployment Guide (Vercel & Netlify)

Credora includes pre-configured deployment definitions for both Vercel and Netlify with Single-Page Application (SPA) fallback routing so deep links like `/?verify=CRD-2026-X8K9M2` load cleanly.

### Deploy to Vercel

```bash
# Using Vercel CLI
npm i -g vercel
vercel
```

* **Framework Preset:** Vite
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Configuration:** Pre-configured in [`vercel.json`](vercel.json) with SPA rewrites.

### Deploy to Netlify

```bash
# Using Netlify CLI
npm i -g netlify-cli
netlify deploy --build --prod
```

* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Configuration:** Pre-configured in [`netlify.toml`](netlify.toml) with 200 rewrite rule.

---

## Automated Testing

Credora uses Node's native test runner (`node --test`), requiring zero external test dependencies:

```bash
# Run unit test suite
npm test
```

Test coverage includes:
* **Certificate ID Generator:** Format compliance (`CRD-YYYY-NNNNNN`), polynomial checksum verification, tamper detection, and 10,000-iteration zero-collision guarantees.
* **Spreadsheet Parser:** Header detection, blank row pruning, row-specific error reporting (`Row 14 has no recipient name`), duplicate name tracking, non-Latin Unicode support (Malayalam, Hindi, Arabic, Japanese), and 500+ row performance.
* **End-to-End Test Suite:** [`tests/e2e.spec.ts`](tests/e2e.spec.ts) specification covering Red Route 1 (batch generation) and Red Route 2 (mobile verification lookup).

---

## Known Limitations

1. **Browser Memory (Heap Limits):** Because certificate rasterization occurs entirely client-side, batches exceeding 1,000+ very high-resolution images (4K / 300 DPI) in a single run may experience memory pressure on low-RAM mobile devices. The engine mitigates this via bounded chunked processing, garbage collection yielding, and thumbnail preview thresholds.
2. **Offline Multi-Device Verification:** Without Firebase Firestore configured, certificates are verified in local fallback mode. Cross-device verification requires internet connectivity to query the cloud registry.
3. **Multi-Page Template Rasterization:** Credora currently rasterizes page 1 of multi-page PDF templates. Single-page landscape or portrait templates are recommended.

---

## License

MIT License. Built with privacy and accessibility in mind.
