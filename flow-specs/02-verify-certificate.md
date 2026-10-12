# Flow Spec 02: Verify a Certificate

**Goal:** A certificate recipient or verifier user wants to confirm the authenticity and validity of an issued certificate.
**Covers:** R12, R16, R17

---

## Entry Points

- **From smartphone camera scan:** The verifier points their mobile camera at the QR code printed on an issued certificate.
- **From direct verification link:** The verifier opens a shared link containing certificate identifier parameters.
- **From export preview:** An organizer selects the verification action on a generated certificate card on the Export Screen.

---

## The Flow

### Step 1: Scan QR Code or Open Verification Route

**What they want:** The verifier wants to access the certificate authentication record without installing third-party applications.

**What they see:** The verifier's mobile or desktop browser opens the application URL containing query parameters representing the unique certificate security stamp and recipient name.

**What they do:** The verifier allows the web browser to load the destination URL.

**What happens:** The application detects the verification query parameters during initial load and immediately opens the Verification Modal.

### Step 2: Inspect Verification Details

**What they want:** The verifier wants unambiguous confirmation that the certificate was legitimately issued to the named recipient.

**What they see:** The Verification Modal presenting an authenticity status banner, the verified recipient name, the issuing organization, the unique cryptographic security stamp, and a trust seal statement.

**What they do:** The verifier inspects the displayed recipient name and security stamp against their physical or digital document.

**What happens:** The system keeps the verified record visible in the foreground modal.

### Step 3: Dismiss Verification Inspection

**What they want:** The verifier wants to close the inspection window and return to the main interface.

**What they see:** The Verification Modal with a prominent dismissal action and a header close control.

**What they do:** The verifier clicks the dismissal action or presses the escape key.

**What happens:** The system closes the Verification Modal and presents the underlying application workspace.

---

## Edge Cases

| Scenario | What the user sees |
|---|---|
| Empty parameter route | If the verification route is accessed with an empty certificate identifier, the modal is not opened and the standard workspace appears. |
| Loading verification parameters | A brief transition while parsing incoming URL parameters before the verification dialog surfaces. |
| Partial parameter data | If the URL contains a valid certificate identifier but omits the recipient name, the modal displays the security stamp alongside a fallback placeholder for the holder. |
| Damaged or invalid certificate identifier | An error status indicator in the verification modal stating the certificate identifier format is invalid or unverified. |
| Offline device scan | If the device lacks internet connectivity when scanning the QR code, the browser displays standard offline messaging until a connection is re-established. |

---

## New User vs. Returning User

- The verification experience is identical for first-time scanners and returning verifiers, providing instantaneous zero-setup validation.

---

## UX Notes

- Immediate reassurance is paramount: the verified status badge and recipient name must be the most prominent content.
- Works entirely client-side without requiring verifiers to sign up, log in, or install specialized scanner software.

---

## Prototype Scope

- Verification Modal in verified state displaying recipient name, issuing authority, and cryptographic stamp.
- Verification Modal in invalid or error state indicating unrecognized certificate parameters.
