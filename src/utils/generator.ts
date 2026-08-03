import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import type {
  TemplateFile,
  SpreadsheetData,
  FieldMapping,
  OutputOptions,
  GeneratedCert,
} from '../types';

/**
 * Case-insensitive helper to retrieve column values from a row dictionary.
 */
export function getRowValue(row: Record<string, any>, targetColumn: string): string {
  if (!row || !targetColumn) return '';

  const cleanTarget = targetColumn.toLowerCase().trim();

  // 1. Direct match
  if (row[targetColumn] !== undefined && row[targetColumn] !== null) {
    return String(row[targetColumn]).trim();
  }

  // 2. Case-insensitive key match
  const rowKeys = Object.keys(row);
  const foundKey = rowKeys.find((k) => k.toLowerCase().trim() === cleanTarget);
  if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
    return String(row[foundKey]).trim();
  }

  // 3. Fallback synonym matching for 'name'
  if (['name', 'full_name', 'fullname', 'student_name', 'recipient'].includes(cleanTarget)) {
    const synonymKey = rowKeys.find((k) =>
      ['name', 'full_name', 'fullname', 'student_name', 'recipient'].includes(
        k.toLowerCase().trim()
      )
    );
    if (synonymKey && row[synonymKey] !== undefined && row[synonymKey] !== null) {
      return String(row[synonymKey]).trim();
    }
  }

  return '';
}

/**
 * Helper to split a long string into wrapped lines for canvas rendering.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [text];
}

/**
 * Generate a single certificate canvas at full High-DPI resolution.
 */
export async function renderCertificateCanvas(
  template: TemplateFile,
  row: Record<string, any>,
  mappings: FieldMapping[],
  certId: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Load template image
  const templateImg = new Image();
  templateImg.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    templateImg.onload = () => resolve();
    templateImg.onerror = () => reject(new Error('Failed to load certificate template image'));
    templateImg.src = template.dataUrl;
  });

  const canvasWidth = templateImg.naturalWidth || template.width || 1920;
  const canvasHeight = templateImg.naturalHeight || template.height || 1080;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Draw background template image
  ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);

  // Await browser web fonts readiness
  await document.fonts.ready;

  // Reference width base = 1000px for proportional scaling parity
  const scaleFactor = canvasWidth / 1000;

  // Render each field mapping
  for (const mapping of mappings) {
    const { x, y, width, height, fontFamily, fontSize, fontWeight, fontStyle, color, textAlign, textTransform, lineHeight } = mapping.style;

    const effectiveFontSize = Math.max(10, fontSize * scaleFactor);
    const xPx = (x / 100) * canvasWidth;
    const yPx = (y / 100) * canvasHeight;
    const maxBoxWidthPx = (width / 100) * canvasWidth;
    const maxBoxHeightPx = (height / 100) * canvasHeight;

    if (mapping.type === 'qr_code') {
      // Generate QR Code overlay
      const recipientName = getRowValue(row, mapping.columnName || 'name') || 'Recipient';
      const verifyUrl = `https://verify.credora.app/${certId}?recipient=${encodeURIComponent(recipientName)}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: Math.max(120, maxBoxWidthPx),
          color: { dark: '#000000', light: '#ffffff' },
        });

        const qrImg = new Image();
        await new Promise<void>((res) => {
          qrImg.onload = () => res();
          qrImg.src = qrDataUrl;
        });

        const qrSize = Math.max(80, maxBoxWidthPx);
        ctx.drawImage(qrImg, xPx, yPx, qrSize, qrSize);
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    } else {
      // Text Field (Column Dynamic or Custom Static)
      let textValue = '';
      if (mapping.type === 'column' && mapping.columnName) {
        textValue = getRowValue(row, mapping.columnName);
      } else if (mapping.type === 'custom') {
        textValue = mapping.customText || '';
      }

      if (!textValue) continue;

      // Apply case transformations
      if (textTransform === 'uppercase') textValue = textValue.toUpperCase();
      if (textTransform === 'capitalize') {
        textValue = textValue.replace(/\b\w/g, (l) => l.toUpperCase());
      }

      ctx.save();

      // Configure font styles
      const stylePrefix = fontStyle === 'italic' ? 'italic ' : '';
      const weightPrefix = fontWeight ? `${fontWeight} ` : '';
      ctx.font = `${stylePrefix}${weightPrefix}${effectiveFontSize}px ${fontFamily}`;

      ctx.fillStyle = color || '#000000';
      ctx.textAlign = (textAlign as CanvasTextAlign) || 'center';
      ctx.textBaseline = 'middle';

      let lineXpx = xPx;
      if (textAlign === 'center') lineXpx = xPx + maxBoxWidthPx / 2;
      if (textAlign === 'right') lineXpx = xPx + maxBoxWidthPx;

      // Word wrapping for paragraphs
      const lines = wrapText(ctx, textValue, maxBoxWidthPx);
      const computedLineHeight = effectiveFontSize * (lineHeight || 1.3);
      const totalTextHeight = lines.length * computedLineHeight;

      // Vertically center paragraph inside maxBoxHeightPx
      const startYpx = yPx + (maxBoxHeightPx - totalTextHeight) / 2 + computedLineHeight / 2;

      lines.forEach((line, lineIdx) => {
        const currentLineYpx = startYpx + lineIdx * computedLineHeight;
        ctx.fillText(line, lineXpx, currentLineYpx);
      });

      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Format filename based on user pattern and row data.
 */
function buildFilename(
  pattern: string,
  row: Record<string, any>,
  index: number,
  format: string
): string {
  let name = pattern;

  // Replace placeholders
  Object.keys(row).forEach((col) => {
    const val = String(row[col] || '');
    name = name.replace(new RegExp(`{{\\s*${col}\\s*}}`, 'gi'), val);
  });

  // Fallback recipient name
  const recipient = getRowValue(row, 'name') || getRowValue(row, 'full_name') || `Recipient_${index + 1}`;
  name = name.replace(/{{\s*name\s*}}/gi, recipient);
  name = name.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (!name.endsWith(`.${format}`)) {
    name = `${name}.${format}`;
  }

  return name;
}

/**
 * Batch generate certificates for all rows and bundle into a JSZip file.
 * Memory Optimized: Streams binary data directly into JSZip and caps preview items
 * to prevent browser 'Array buffer allocation failed' memory crashes on large datasets.
 */
export async function batchGenerateCertificates(
  template: TemplateFile,
  spreadsheet: SpreadsheetData,
  mappings: FieldMapping[],
  options: OutputOptions,
  onProgress?: (progressPct: number, currentItem: string) => void
): Promise<{ zipBlob: Blob; certificates: GeneratedCert[] }> {
  const zip = new JSZip();
  const certificates: GeneratedCert[] = [];
  const totalRows = spreadsheet.rows.length;
  const MAX_PREVIEW_ITEMS = 24; // Limit heavy base64 preview thumbnails in RAM

  for (let i = 0; i < totalRows; i++) {
    const row = spreadsheet.rows[i];
    const certId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const recipientName = getRowValue(row, spreadsheet.nameHeader) || getRowValue(row, 'name') || `Recipient ${i + 1}`;

    if (onProgress) {
      const pct = Math.round(((i + 1) / totalRows) * 100);
      onProgress(pct, `${i + 1}/${totalRows}: ${recipientName}`);
    }

    // Render Canvas
    const canvas = await renderCertificateCanvas(template, row, mappings, certId);
    const filename = buildFilename(options.filenamePattern, row, i, options.format);

    let fileBuffer: ArrayBuffer;
    let crispDataUrl = '';

    if (options.format === 'pdf') {
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true,
      });

      const highResDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(highResDataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
      fileBuffer = pdf.output('arraybuffer');

      if (i < MAX_PREVIEW_ITEMS) {
        crispDataUrl = highResDataUrl;
      }
    } else {
      const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
      crispDataUrl = canvas.toDataURL(mimeType, options.imageQuality || 0.95);
      const res = await fetch(crispDataUrl);
      fileBuffer = await res.arrayBuffer();
    }

    // Add binary ArrayBuffer directly to ZIP (Zero redundant base64 copies)
    zip.file(filename, fileBuffer);

    // Keep lightweight thumbnail objects for UI rendering
    if (i < MAX_PREVIEW_ITEMS) {
      const fileBlob = new Blob([fileBuffer], {
        type: options.format === 'pdf' ? 'application/pdf' : options.format === 'jpg' ? 'image/jpeg' : 'image/png',
      });

      certificates.push({
        id: certId,
        recipientName,
        filename,
        blob: fileBlob,
        dataUrl: crispDataUrl,
        rowIndex: i,
      });
    } else {
      // Memory stub for items past 24
      const fileBlob = new Blob([fileBuffer], {
        type: options.format === 'pdf' ? 'application/pdf' : options.format === 'jpg' ? 'image/jpeg' : 'image/png',
      });

      certificates.push({
        id: certId,
        recipientName,
        filename,
        blob: fileBlob,
        dataUrl: '', // Omit heavy string from RAM
        rowIndex: i,
      });
    }

    // Explicitly release canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { zipBlob, certificates };
}
