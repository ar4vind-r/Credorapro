# Credora 3-Minute Walkthrough & Demo Script (DEMO_SCRIPT.md)

**Target Audience:** Evaluators, stakeholders, conference attendees.  
**Target Duration:** 3 minutes (180 seconds).  
**Core Story:** How Credora enables instant, privacy-first bulk certificate generation with tamper-proof cryptographic verification.

---

## Cue-by-Cue Walkthrough

### Act 1: Intake & Setup (0:00 – 0:35)
* **Narrative:** *"Event organizers often spend hours manually designing and emailing certificates. Credora runs entirely client-side, processing hundreds of certificates without sending attendee data to third-party servers."*
* **On-Screen Action:**
  1. Open Credora at `http://localhost:5173` (or the deployed URL).
  2. Point out the brutalist interface: Step 1 Upload Intake with dual dropzones.
  3. Click **"Load Sample"** in the top navigation.
  4. Note that the template (1920×1080) and 3 sample attendees (`Alex Rivera`, `Jordan Lee`, `Taylor Swift`) are parsed instantly.
  5. Scroll down to show the attendee table preview with the live search filter.
  6. Click the dominant primary button: **"Continue to Map Fields (3 Attendees)"**.

---

### Act 2: Precision Canvas Mapping & Privacy Control (0:35 – 1:20)
* **Narrative:** *"In Step 2, organizers get precision layout control without clunky design tools."*
* **On-Screen Action:**
  1. Click the **"Recipient Name"** field on the canvas.
  2. Press **Arrow Keys** (or click on-screen directional buttons) to demonstrate micro-nudging (0.2% precision) with the real-time coordinate badge visible.
  3. Show the **Preview Row Switcher**: click next (`]`) to show `Jordan Lee` and `Taylor Swift` rendering live with auto-scaling text.
  4. In the left palette, point out the **Authenticity QR Code** overlay.
  5. In the right property inspector, highlight the **"Show on Verification Page"** privacy toggle:
     - Notice that attendee names and courses are public, while sensitive columns (like email/phone) default to private.
  6. Press **`Ctrl + Enter`** (or click **"Continue to Export"**).

---

### Act 3: Chunked Bulk Generation & ZIP Download (1:20 – 1:55)
* **Narrative:** *"Credora's batch engine renders certificates in non-blocking memory chunks with live progress and cancel protection."*
* **On-Screen Action:**
  1. Review export options: Select **PDF** (or PNG) format and **Balanced (92%)** quality.
  2. Click **"Generate 3 Certificates"**.
  3. Watch the live progress bar and screen reader live region announcing attendee names.
  4. Confetti triggers upon completion!
  5. Point out the result: **"Batch Completed Successfully"**.
  6. Click **"Download ZIP (3 Files)"** to save the bundled package locally.
  7. Click the **Eye icon** on Alex Rivera's thumbnail card to expand a high-resolution preview modal.

---

### Act 4: QR Verification & Fraud Detection (1:55 – 2:40)
* **Narrative:** *"Earlier solutions relied on URL query parameters that anyone could forge. Credora issues unique cryptographic IDs backed by registry lookup."*
* **On-Screen Action:**
  1. On Alex Rivera's thumbnail card, click the green **"Verify"** action.
  2. The mobile-first **Verification Modal** opens:
     - Point out the status-first hierarchy:
       - Green **Official Record Found: Certificate Verified** badge.
       - Recipient name: **ALEX RIVERA** in dominant typography.
       - Unique identifier: `CRD-2026-XXXXXX` with dual checksum.
       - Published metadata: Course, Issue Date, Issuer.
  3. Test **Tamper / Fake ID Detection**:
     - In the modal's search input at the bottom, type a fabricated ID: `CRD-2026-FAKE00`.
     - Click **"Verify"**.
     - Point out the red **"No certificate with this number exists"** status state.
     - Emphasize: *Credora never shows a green verified state for an unrecognized or fabricated ID.*

---

### Act 5: Summary & Architecture (2:40 – 3:00)
* **Narrative:** *"Credora combines local-first browser rendering, cryptographic identifier checksums, and accessible design into a bulletproof certificate issuing platform."*
* **On-Screen Action:**
  1. Press **Escape** to dismiss the modal cleanly.
  2. Conclude the presentation.

---

## Quick Reference Test IDs

| Test Case | Certificate ID | Expected Result |
|:---|:---|:---|
| Genuine Record (Demo) | Generated in Step 3 | Verified badge, recipient name, published details |
| Tampered / Fabricated ID | `CRD-2026-FAKE00` | Error: *"No certificate with this number exists"* |
| Checksum Mismatch | `CRD-2026-XXXXXX` | Checksum failed / record unverified |
