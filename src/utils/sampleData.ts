import type { TemplateFile, SpreadsheetData, FieldMapping } from '../types';

/**
 * Generate a high-DPI Golden Diploma SVG template.
 */
export function getDefaultSampleTemplate(): TemplateFile {
  const width = 1920;
  const height = 1080;

  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>

    <!-- Outer Deep Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

    <!-- Gold Double Frame Border -->
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="url(#goldGrad)" stroke-width="4" rx="16"/>
    <rect x="56" y="56" width="${width - 112}" height="${height - 112}" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="8 4" rx="12"/>

    <!-- Corner Decorative Accents -->
    <path d="M 40 100 L 100 40 M 40 120 L 120 40" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M ${width - 40} 100 L ${width - 100} 40 M ${width - 40} 120 L ${width - 120} 40" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M 40 ${height - 100} L 100 ${height - 40} M 40 ${height - 120} L 120 ${height - 40}" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M ${width - 40} ${height - 100} L ${width - 100} ${height - 40} M ${width - 40} ${height - 120} L ${width - 120} ${height - 40}" stroke="url(#goldGrad)" stroke-width="2"/>

    <!-- Header Emblem Circle -->
    <g transform="translate(${width / 2}, 160)">
      <circle r="36" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <polygon points="0,-20 18,12 -18,12" fill="url(#goldGrad)"/>
      <circle r="6" fill="#fef08a"/>
    </g>

    <!-- Fixed Header Titles -->
    <text x="${width / 2}" y="240" text-anchor="middle" font-family="'Cinzel', serif" font-size="42" font-weight="700" fill="url(#goldGrad)" letter-spacing="6">CERTIFICATE OF PARTICIPATION</text>
    <text x="${width / 2}" y="280" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="500" fill="#94a3b8" letter-spacing="4">THIS IS PROUDLY PRESENTED TO</text>
    <text x="${width / 2}" y="780" text-anchor="middle" font-family="'Playfair Display', serif" font-size="18" font-weight="600" fill="#94a3b8" letter-spacing="2">SOLASTA’26 • STACS, NSSCE</text>

    <!-- Signature Lines -->
    <g transform="translate(${width * 0.25}, ${height - 160})">
      <line x1="-120" y1="0" x2="120" y2="0" stroke="url(#goldGrad)" stroke-width="1.5"/>
      <text x="0" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94a3b8">EVENT CONVENER</text>
    </g>

    <g transform="translate(${width * 0.75}, ${height - 160})">
      <line x1="-120" y1="0" x2="120" y2="0" stroke="url(#goldGrad)" stroke-width="1.5"/>
      <text x="0" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94a3b8">HOD, NSSCE</text>
    </g>
  </svg>
  `;

  const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

  return {
    name: 'Solasta_26_Participation_Diploma.svg',
    type: 'image',
    dataUrl,
    width,
    height,
  };
}

/**
 * Built-in Sample Student Recipient Dataset.
 */
export const SAMPLE_SPREADSHEET: SpreadsheetData = {
  fileName: 'Solasta26_Participants.csv',
  headers: ['Name', 'Event', 'College', 'Date', 'Email', 'Phone'],
  nameHeader: 'Name',
  rows: [
    {
      Name: 'Alexander Hamilton',
      Event: 'INNOVATION AUCTION',
      College: 'NSSCE',
      Date: '7th MARCH 2026',
      Email: 'alex@example.com',
      Phone: '+91 98765 43210',
    },
    {
      Name: 'Sophia Montgomery',
      Event: 'INNOVATION AUCTION',
      College: 'STACS',
      Date: '7th MARCH 2026',
      Email: 'sophia@example.com',
      Phone: '+91 98765 43211',
    },
    {
      Name: 'Marcus Vance',
      Event: 'INNOVATION AUCTION',
      College: 'NSSCE',
      Date: '7th MARCH 2026',
      Email: 'marcus@example.com',
      Phone: '+91 98765 43212',
    },
    {
      Name: 'Elena Rostova',
      Event: 'INNOVATION AUCTION',
      College: 'STACS',
      Date: '7th MARCH 2026',
      Email: 'elena@example.com',
      Phone: '+91 98765 43213',
    },
  ],
};

/**
 * Default field mapping overlays with custom body narrative text.
 */
export function getDefaultFieldMappings(): FieldMapping[] {
  return [
    {
      id: 'field_name',
      type: 'column',
      columnName: 'Name',
      label: 'Recipient Name',
      showOnVerification: true,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 54,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#fef08a',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
        lineHeight: 1.2,
        x: 10,
        y: 32,
        width: 80,
        height: 10,
      },
    },
    {
      id: 'field_body_narrative',
      type: 'custom',
      customText: "has actively participated in the INNOVATION AUCTION competition as part of SOLASTA’26 by STACS, NSSCE on 7th MARCH 2026",
      label: 'Event Body Paragraph',
      showOnVerification: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 22,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'none',
        letterSpacing: 0,
        lineHeight: 1.4,
        x: 15,
        y: 46,
        width: 70,
        height: 14,
      },
    },
    {
      id: 'field_qr',
      type: 'qr_code',
      columnName: 'Name',
      label: 'Verification QR Code',
      showOnVerification: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'none',
        letterSpacing: 0,
        lineHeight: 1,
        x: 46,
        y: 63,
        width: 8,
        height: 12,
      },
    },
    {
      id: 'field_cert_no',
      type: 'certificate_no',
      label: 'Certificate No.',
      showOnVerification: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#94a3b8',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
        lineHeight: 1,
        x: 35,
        y: 76,
        width: 30,
        height: 4,
      },
    },
  ];
}
