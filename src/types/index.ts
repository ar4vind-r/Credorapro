export type TemplateType = 'image' | 'pdf';

export interface TemplateFile {
  name: string;
  type: TemplateType;
  dataUrl: string;
  width: number;
  height: number;
  pdfBytes?: ArrayBuffer;
  numPages?: number;
  selectedPage?: number;
}

export type SpreadsheetRow = Record<string, string | number | boolean>;

export interface SpreadsheetData {
  fileName: string;
  headers: string[];
  rows: SpreadsheetRow[];
  nameHeader: string;
}

export interface FieldStyle {
  fontFamily: string;
  fontSize: number; // in pixels relative to template standard size
  fontWeight: 'normal' | '500' | '600' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'capitalize';
  letterSpacing: number; // in px
  lineHeight: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage width
  height: number; // percentage height
}

export interface FieldMapping {
  id: string;
  type: 'column' | 'custom' | 'qr_code' | 'certificate_no';
  columnName?: string;
  customText?: string;
  label: string;
  style: FieldStyle;
  showOnVerification?: boolean; // Privacy control: true for published public verification, false for private
}

export interface MappingPreset {
  id: string;
  name: string;
  fields: FieldMapping[];
}

export interface OutputOptions {
  format: 'pdf' | 'png' | 'jpg';
  filenamePattern: string; // e.g., "{{name}}_{{cert_id}}"
  pdfOrientation: 'landscape' | 'portrait' | 'auto';
  imageQuality: number; // 0.8 to 1.0
  issuerName?: string;
}

export interface GeneratedCert {
  id: string;
  rowIndex: number;
  recipientName: string;
  filename: string;
  dataUrl: string;
  blob: Blob;
  details?: Record<string, any>;
}

export interface CertificateRecord {
  cert_id: string; // primary key (CRD-YYYY-NNNNNN)
  recipient_name: string;
  details: Record<string, any>; // JSON from mapped columns with showOnVerification === true
  issued_at: string; // ISO timestamp
  issuer: string;
  status: 'valid' | 'revoked';
  revoked_reason?: string;
}

export type VerificationState =
  | { status: 'idle' }
  | { status: 'loading'; certId: string }
  | { status: 'valid'; cert: CertificateRecord }
  | { status: 'revoked'; cert: CertificateRecord }
  | { status: 'not_found'; certId: string }
  | { status: 'network_error'; error: string; certId: string }
  | { status: 'unverified_fallback'; certId: string; recipientName?: string };

export type AppStep = 'upload' | 'mapping' | 'generate' | 'complete';

export const AVAILABLE_FONTS = [
  { name: 'Cinzel (Luxury Serif)', value: 'Cinzel, serif' },
  { name: 'Playfair Display (Elegant Serif)', value: 'Playfair Display, serif' },
  { name: 'Great Vibes (Calligraphy Script)', value: 'Great Vibes, cursive' },
  { name: 'Alex Brush (Formal Script)', value: 'Alex Brush, cursive' },
  { name: 'Cormorant Garamond (Classic Serif)', value: 'Cormorant Garamond, serif' },
  { name: 'Montserrat (Modern Sans)', value: 'Montserrat, sans-serif' },
  { name: 'Inter (Clean Sans)', value: 'Inter, sans-serif' },
  { name: 'Roboto (Standard Sans)', value: 'Roboto, sans-serif' },
];
