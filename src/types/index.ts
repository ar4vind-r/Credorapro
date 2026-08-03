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
  type: 'column' | 'custom' | 'qr_code';
  columnName?: string;
  customText?: string;
  label: string;
  style: FieldStyle;
}

export interface MappingPreset {
  id: string;
  name: string;
  fields: FieldMapping[];
}

export interface OutputOptions {
  format: 'pdf' | 'png' | 'jpg';
  filenamePattern: string; // e.g., "{{name}}_Certificate"
  pdfOrientation: 'landscape' | 'portrait' | 'auto';
  imageQuality: number; // 0.8 to 1.0
}

export interface GeneratedCert {
  id: string;
  rowIndex: number;
  recipientName: string;
  filename: string;
  dataUrl: string;
  blob: Blob;
}

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
