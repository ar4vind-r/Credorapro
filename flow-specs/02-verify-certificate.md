# Flow Spec 02: Verify a Certificate

**Goal:** A certificate recipient or verifier user wants to confirm the authenticity and validity of an issued certificate.
**Covers:** R12, R16, R17

---

## Entry Points

- **From smartphone camera scan:** The verifier points their mobile camera at the QR code printed on an issued certificate.
- **From direct verification link:** The verifier opens a shared link containing the certificate identifier parameter.
- **From export preview:** An organizer selects the verification action on a generated certificate card on the Export Screen.
- **From manual certificate lookup:** The verifier enters the certificate number manually into the verification search input on the application header or home screen for physical or damaged certificates.

---

## The Flow

### Step 1: Scan QR Code or Open Verification Route

**What they want:** The verifier wants to access the certificate authentication record without installing third-party applications.

**What they see:** The verifier's mobile or desktop browser opens the application URL containing strictly the unique certificate identifier parameter (`?verify=ID`), with recipient details omitted to prevent parameter tampering.

**What they do:** The verifier allows the web browser to load the destination URL.

**What happens:** The application detects the verification parameter during initial load and immediately opens the Verification Modal, querying the official registry.

### Step 2: Inspect Verification Details

**What they want:** The verifier wants unambiguous confirmation that the certificate was legitimately issued to the named recipient.

**What they see:** The mobile-first Verification Modal displaying the authentication status first (verified, revoked, not found, or connection error), followed by the recipient name, the unique certificate number, and published event details filtered by privacy settings.

**What they do:** The verifier inspects the displayed status and recipient details against their document, or uses the re-entry search field to check another certificate number.

**What happens:** The system presents the official registry record, or displays actionable guidance and typo checks if the identifier is unrecognized or revoked.

### Step 3: Dismiss Verification Inspection

**What they want:** The verifier wants to close the inspection window and return to the main interface.

**What they see:** The Verification Modal with a prominent dismissal action, a copy-to-clipboard action for the certificate identifier, and a header close control.

**What they do:** The verifier clicks the dismissal action, the header close control, or presses the escape key.

**What happens:** The system closes the Verification Modal and presents the underlying application workspace.

---

## Edge Cases

| Scenario | What the user sees |
|---|---|
| Empty parameter route | If the verification route is accessed with an empty certificate identifier, the modal is not opened and the standard workspace appears. |
| Loading verification parameters | An inline loading skeleton while querying the registry for the certificate identifier. |
| Unrecognized certificate identifier | An explicit not found status stating no certificate with this number exists, with guidance on resolving typos and re-entering the identifier. |
| Revoked certificate | A revoked warning status presenting the revocation reason and invalidation notice. |
| Network connectivity failure | A connection error notice with a retry action to re-attempt the registry query. |
| Unconnected registry fallback | A notice stating details were read from the QR code and are not independently verified, without claiming authenticity. |

---

## New User vs. Returning User

- The verification experience is identical for first-time scanners and returning verifiers, providing instantaneous zero-setup validation.

---

## UX Notes

- Immediate reassurance is paramount: the verified status badge and recipient name must be the most prominent content.
- Mobile-first layout ensures optimal viewing on handheld smartphone screens immediately upon scanning.
- Security and privacy first: URLs encode only short identifiers; mapped fields default to private unless marked for publication.

---

## Prototype Scope

- Verification Modal across valid, revoked, not found, network error, and unverified fallback states.
- Manual certificate identifier search intake and re-entry submission form.
