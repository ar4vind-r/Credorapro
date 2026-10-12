# Screens Inventory — Credora

Standing inventory of all screens in the application, cross-referenced against the flow specs that touch them.

| Screen | Purpose | Flow specs that touch it | States considered |
|---|---|---|---|
| Upload Screen | Intake certificate template and recipient data files with tabular inspection | Flow Spec 01 | Empty, loading, partial (one file uploaded), valid, error (unsupported format) |
| Mapping Studio Screen | Interactive visual placement of recipient fields, static body text, and QR code on template canvas | Flow Spec 01 | Initial default mapping, selected field, empty fields, dragging, keyboard nudging, shortcuts guide |
| Export Screen | Batch rendering configuration, generation progress monitoring, and certificate package download | Flow Spec 01 | Idle settings, generation in progress (loading), batch complete (partial previews, full ZIP), generation error |
| Verification Modal | Inspection and authenticity validation of issued certificates via QR scan or identifier lookup | Flow Spec 02 | Loading verification parameters, valid authentic certificate, revoked certificate, not found identifier, network error, unverified fallback |
