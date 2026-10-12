# Requirements — Credora

> Single source of truth for what this app must do. Every flow spec traces back to a numbered requirement via its `**Covers:**` line. Changes to this file are dated edits — see the Change Log at the bottom.

## Problem Statement

Event organizers, workshop leads, hackathon coordinators, and educational institutions need to issue hundreds of customized certificates quickly and reliably. Existing solutions either require manual copy-pasting, rely on expensive subscription services, send sensitive attendee data to third-party servers, or suffer from text-wrapping and alignment bugs on high-resolution templates. Credora enables fast, private, browser-local bulk certificate generation and instant cryptographic verification.

## The User

- **Who:** Event organizers, club leads, educators, contest administrators, and certificate verifiers/recipients.
- **Context:** Desktop browsers or tablets when creating and exporting certificates; mobile devices and cameras when scanning and verifying issued certificates.
- **Standing accessibility requirements (always apply):**
  - WCAG AA compliance, especially text contrast and size
  - Light mode and dark mode support
  - Font switcher with clear, legible typefaces
  - Scannable UI: structured layouts, short text, clear visual hierarchy
  - Keyboard navigation and shortcut controls for precise canvas manipulation
  - Touch screen gesture support for mobile and tablet editing

## Emotional Core

Confident, instantaneous certificate issuing with complete privacy and zero data leakage.

## Functional Requirements

- **R1:** The app lets the user upload a certificate visual template in image (PNG, JPG) or document (PDF) format with automatic natural dimension detection.
- **R2:** The app lets the user upload recipient spreadsheet data in CSV or XLSX format and parses rows and column headers locally.
- **R3:** The app lets the user load pre-configured sample template and recipient data with one click for immediate testing.
- **R4:** The app provides an interactive visual mapping studio showing the certificate background and mapped dynamic and static text overlays.
- **R5:** The app lets the user map spreadsheet columns to visual overlay positions on the certificate canvas.
- **R6:** The app lets the user add custom static text paragraphs with event presets (such as participation or excellence awards).
- **R7:** The app lets the user position and adjust elements via mouse drag-and-drop, touch gestures, direct coordinates, and keyboard arrow keys with fine and coarse step modes.
- **R8:** The app lets the user format overlay text styling including typeface, size, weight, alignment, case transformation, and color.
- **R9:** The app wraps multi-line paragraphs cleanly across a defined bounding box width without text squishing.
- **R10:** The app provides undo, redo, duplication, and deletion of mapped fields with dedicated keyboard shortcuts.
- **R11:** The app lets the user preview how any recipient row in the spreadsheet renders on the canvas before generating.
- **R12:** The app lets the user add a dynamic cryptographic verification QR code to the certificate linking to the verification portal.
- **R13:** The app batch generates certificates in PDF, PNG, or JPG formats packaged in a single downloadable ZIP archive.
- **R14:** The app manages memory efficiently during batch generation to prevent browser allocation crashes on large recipient lists.
- **R15:** The app displays generation progress feedback and thumbnail previews of generated certificates.
- **R16:** The app provides a certificate verification portal showing authenticity status, recipient name, issuer, and certificate ID via QR code link or manual ID lookup.
- **R17:** The app operates 100% locally in the user's browser without transferring spreadsheet data or certificates to an external server.

## Constraints

- **Design system:** High-contrast brutalist aesthetic with tactile controls and dark mode.
- **Platform:** Modern web browsers (desktop, tablet, mobile).
- **Technical:** Local-first client-side computation (native Canvas 2D, SheetJS, jsPDF, JSZip, QRCode). No required backend server.

## Out of Scope

- Direct email delivery of certificates from within the browser.
- Cloud account synchronization or centralized user database storage.
- Multi-page document generation (single-page certificate templates only).

## Change Log

- **2026-10-12:** Initial version defining requirements R1 through R17 following the User Flow Specs methodology.
