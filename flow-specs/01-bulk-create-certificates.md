# Flow Spec 01: Bulk-Create Certificates

**Goal:** An event organizer user wants to bulk-create customized certificates from attendee spreadsheet data and download them in a single package.
**Covers:** R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R17

---

## Entry Points

- **From browser start:** The organizer opens the application home page to issue certificates for an event.
- **From demo prompt:** The organizer selects the sample data option to test the pipeline before uploading custom files.

---

## The Flow

### Step 1: Upload Template and Recipient Spreadsheet

**What they want:** The organizer wants to supply their graphic template and recipient list without complicated setup.

**What they see:** The Upload Screen presenting two primary intake zones: one for the certificate visual template and one for the spreadsheet recipient list, alongside a direct option to load sample data.

**What they do:** The organizer drops their certificate image or document into the template zone and their spreadsheet file into the data zone.

**What happens:** The system parses the files locally in the browser, confirms natural dimensions for the template, parses tabular rows and headers, and activates the progression control.

### Step 2: Review Recipient Data

**What they want:** The organizer wants to verify that attendee names and details were parsed correctly.

**What they see:** A preview table on the Upload Screen listing the parsed rows and columns, a search filter to inspect individual names, and a selector confirming which column contains the recipient name.

**What they do:** The organizer confirms the recipient name column mapping and proceeds to the mapping studio.

**What happens:** The application stores the parsed records in local memory and transitions to the Mapping Studio Screen.

### Step 3: Position Dynamic Recipient Fields on Canvas

**What they want:** The organizer wants the recipient's name and details to appear in the exact visual position intended by the certificate design.

**What they see:** The Mapping Studio Screen displaying the certificate template preview with selectable text boxes representing mapped spreadsheet fields, each showing live data from the first attendee row.

**What they do:** The organizer drags or nudges the recipient name text box into position using arrow keys or precision directional controls.

**What happens:** The system updates the field coordinates in real time and displays its active boundary and coordinates indicator.

### Step 4: Add Custom Event Text and Verification QR Code

**What they want:** The organizer wants to include a standardized competition description paragraph and a scannable verification seal.

**What they see:** The field palette on the Mapping Studio Screen offering options to add custom text, standard event description presets, and an authenticity QR code overlay.

**What they do:** The organizer selects an event preset paragraph, edits the text in the property inspector, and places a verification QR code in a corner.

**What happens:** The system wraps the multi-line text cleanly across the allocated width and renders a square QR code box linked to the verification URL.

### Step 5: Format Typography and Inspect Across Rows

**What they want:** The organizer wants the text styling to match the event branding and ensure long names fit properly.

**What they see:** The typography panel on the Mapping Studio Screen with typeface choices, type scale, weight, text alignment, letter casing controls, and a row switcher to preview different attendees.

**What they do:** The organizer adjusts type scale, selects center alignment, and flips through several recipient rows to verify appearance.

**What happens:** The canvas re-renders with the chosen typography and updates text content to reflect each selected recipient row.

### Step 6: Configure Export Format and Batch Render

**What they want:** The organizer wants to produce high-resolution certificate files for all attendees in one operation.

**What they see:** The Export Screen displaying output format choices (document or image format), filename naming pattern options, and a primary generation action showing the total certificate count.

**What they do:** The organizer selects their preferred output format and initiates batch generation.

**What happens:** The system begins rendering certificates sequentially in memory-managed batches, displaying a progress indicator with the current attendee name being processed.

### Step 7: Download Certificate Archive

**What they want:** The organizer wants to save all generated certificates to their computer.

**What they see:** The completed Export Screen showing a success confirmation, thumbnail preview cards of generated certificates, and a primary action to download the full package.

**What they do:** The organizer clicks the download action.

**What happens:** The system bundles all rendered files into a compressed archive and initiates a direct file download to the organizer's computer.

---

## Edge Cases

| Scenario | What the user sees |
|---|---|
| Empty state on initial visit | The Upload Screen displays empty intake zones with instructional text and a prompt to load sample demonstration data. |
| Loading state during file parsing | An inline progress indicator while reading large spreadsheets or rasterizing document pages. |
| Partial state with only one file provided | The completed intake zone confirms the loaded file while the missing zone remains highlighted, with the continue action disabled. |
| Corrupt or damaged spreadsheet file | An error banner stating the file could not be parsed with instructions to verify format and columns. |
| Unsupported template format | An error banner stating the file format is not supported with accepted file extensions listed. |
| Memory pressure on large batch list | The batch engine processes certificates in bounded memory chunks and frees canvas buffers, preventing browser allocation crashes. |
| Partial batch preview display | For very large batches exceeding preview thresholds, the interface displays the first batch of visual thumbnails alongside summary status indicators for the remaining certificates. |

---

## New User vs. Returning User

- **New User:** Encounters empty intake cards and prominent sample data loader to explore the 3-step workflow immediately.
- **Returning User:** Can directly load previously exported mapping configurations to skip repetitive field positioning.

---

## UX Notes

- Emphasizes speed, zero learning curve, and local-first privacy.
- Supports fine precision alignment via keyboard arrow nudging (fine and coarse modes) alongside direct drag-and-drop.
- Proportional canvas scaling ensures exact parity between studio preview and final high-resolution exported documents.

---

## Prototype Scope

- Upload Screen with dual intake dropzones, empty state, loaded state, and recipient table preview.
- Mapping Studio Screen with canvas preview, draggable text overlays, active selection indicator, and property panel.
- Mapping Studio Screen with on-screen precision nudge controls and keyboard shortcuts helper dialog.
- Export Screen in idle state with format configuration options.
- Export Screen in active loading progress state.
- Export Screen in completed state with thumbnail gallery and download action.
