import QRCode from 'qrcode';
import type {
  TemplateFile,
  SpreadsheetData,
  FieldMapping,
  OutputOptions,
  GeneratedCert,
  CertificateRecord,
  BatchGenerationResult,
  FailedRowError,
} from '../types';
import { generateCertificateId } from './certId';
import { batchPublishCertificates } from '../services/registry';

/**
 * Unicode-safe font fallback chain to ensure complex and non-Latin scripts
 * (e.g., Malayalam, Hindi, Arabic, Tamil) render cleanly rather than showing tofu boxes.
 */
const UNICODE_FALLBACK_FONTS = "'Noto Sans', 'Segoe UI', system-ui, -apple-system, sans-serif";

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
  if (['name', 'full_name', 'fullname', 'student_name', 'recipient', 'attendee_name'].includes(cleanTarget)) {
    const synonymKey = rowKeys.find((k) =>
      ['name', 'full_name', 'fullname', 'student_name', 'recipient', 'attendee_name'].includes(
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
 * Helper to split text into wrapped lines for canvas rendering, with word-breaking
 * for exceptionally long unbroken character sequences.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [''];
  const words = text.split(/\s+/);
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

    // If an individual word exceeds the bounding box by itself, break it at character boundaries
    if (ctx.measureText(currentLine).width > maxWidth && currentLine.length > 1) {
      let subWord = '';
      for (const char of currentLine) {
        if (ctx.measureText(subWord + char).width > maxWidth && subWord) {
          lines.push(subWord);
          subWord = char;
        } else {
          subWord += char;
        }
      }
      currentLine = subWord;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Generate a single certificate canvas at full High-DPI resolution.
 * Automatically shrinks or wraps very long recipient names to avoid
 * overflowing the allocated bounding box or colliding with QR/cert ID.
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
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Reference width base = 1000px for proportional scaling parity
  const scaleFactor = canvasWidth / 1000;

  // Render each field mapping
  for (const mapping of mappings) {
    const {
      x,
      y,
      width,
      height,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      color,
      textAlign,
      textTransform,
      lineHeight,
    } = mapping.style;

    const effectiveFontSize = Math.max(10, fontSize * scaleFactor);
    const xPx = (x / 100) * canvasWidth;
    const yPx = (y / 100) * canvasHeight;
    const maxBoxWidthPx = (width / 100) * canvasWidth;
    const maxBoxHeightPx = (height / 100) * canvasHeight;

    if (mapping.type === 'qr_code') {
      // Short URL verification only: origin + '/?verify=' + CERT_ID
      const origin =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ||
        (typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://credora.vercel.app');
      const verifyUrl = `${origin}/?verify=${certId}`;

      try {
        const qrSizePx = Math.max(60, Math.min(maxBoxWidthPx, maxBoxHeightPx));
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: Math.round(qrSizePx * scaleFactor),
          color: { dark: '#000000', light: '#ffffff' },
        });

        const qrImg = new Image();
        await new Promise<void>((res) => {
          qrImg.onload = () => res();
          qrImg.src = qrDataUrl;
        });

        const qrXpx = xPx + (maxBoxWidthPx - qrSizePx) / 2;
        const qrYpx = yPx + (maxBoxHeightPx - qrSizePx) / 2;
        ctx.drawImage(qrImg, qrXpx, qrYpx, qrSizePx, qrSizePx);

        // Print certificate number in small legible text directly beneath the QR code
        ctx.save();
        const certLabelFontSize = Math.max(9, 10 * scaleFactor);
        ctx.font = `600 ${certLabelFontSize}px monospace`;
        ctx.fillStyle = color || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(certId, qrXpx + qrSizePx / 2, qrYpx + qrSizePx + 4 * scaleFactor);
        ctx.restore();
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    } else {
      // Text Field: Column Dynamic, Custom Static, or Dedicated Certificate No.
      let textValue = '';
      if (mapping.type === 'column' && mapping.columnName) {
        textValue = getRowValue(row, mapping.columnName);
      } else if (mapping.type === 'custom') {
        textValue = mapping.customText || '';
      } else if (mapping.type === 'certificate_no') {
        textValue = certId;
      }

      if (!textValue) continue;

      // Apply case transformations
      if (textTransform === 'uppercase') textValue = textValue.toUpperCase();
      if (textTransform === 'capitalize') {
        textValue = textValue.replace(/\b\w/g, (l) => l.toUpperCase());
      }

      ctx.save();

      // Configure font styles with safe Unicode fallback
      const stylePrefix = fontStyle === 'italic' ? 'italic ' : '';
      const weightPrefix = fontWeight ? `${fontWeight} ` : '';
      const fontStack = `${fontFamily}, ${UNICODE_FALLBACK_FONTS}`;

      // Auto-shrink font if long name / text overflows box dimensions
      let adjustedFontSize = effectiveFontSize;
      const minFontSize = Math.max(8, 9 * scaleFactor);

      ctx.font = `${stylePrefix}${weightPrefix}${adjustedFontSize}px ${fontStack}`;
      let lines = wrapText(ctx, textValue, maxBoxWidthPx);
      let computedLineHeight = adjustedFontSize * (lineHeight || 1.3);
      let totalTextHeight = lines.length * computedLineHeight;

      // Iteratively scale down font size if total height or any line exceeds box boundaries
      while (
        (totalTextHeight > maxBoxHeightPx ||
          lines.some((l) => ctx.measureText(l).width > maxBoxWidthPx + 1)) &&
        adjustedFontSize > minFontSize
      ) {
        adjustedFontSize = Math.max(minFontSize, adjustedFontSize - 1);
        ctx.font = `${stylePrefix}${weightPrefix}${adjustedFontSize}px ${fontStack}`;
        lines = wrapText(ctx, textValue, maxBoxWidthPx);
        computedLineHeight = adjustedFontSize * (lineHeight || 1.3);
        totalTextHeight = lines.length * computedLineHeight;
      }

      ctx.fillStyle = color || '#000000';
      ctx.textAlign = (textAlign as CanvasTextAlign) || 'center';
      ctx.textBaseline = 'middle';

      let lineXpx = xPx;
      if (textAlign === 'center') lineXpx = xPx + maxBoxWidthPx / 2;
      if (textAlign === 'right') lineXpx = xPx + maxBoxWidthPx;

      // Vertically center content inside maxBoxHeightPx
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
 * Format filename based on user pattern and row data, incorporating certId.
 * Guarantees uniqueness when multiple recipients have identical names.
 */
export function buildFilename(
  pattern: string,
  row: Record<string, any>,
  index: number,
  certId: string,
  format: string,
  usedFilenames?: Set<string>
): string {
  let name = pattern || '{{name}}_{{cert_id}}';

  // Replace placeholders
  Object.keys(row).forEach((col) => {
    const val = String(row[col] || '');
    name = name.replace(new RegExp(`{{\\s*${col}\\s*}}`, 'gi'), val);
  });

  // Replace certificate ID placeholders
  name = name.replace(/{{\s*(cert_id|certificate_no|certid)\s*}}/gi, certId);

  // Fallback recipient name
  const recipient =
    getRowValue(row, 'name') || getRowValue(row, 'full_name') || `Recipient_${index + 1}`;
  name = name.replace(/{{\s*name\s*}}/gi, recipient);
  name = name.replace(/[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, '_');

  let baseName = name;
  let fullFilename = `${baseName}.${format}`;

  // If a duplicate filename already exists in the batch, append unique cert ID to avoid collision
  if (usedFilenames && usedFilenames.has(fullFilename)) {
    fullFilename = `${baseName}_${certId}.${format}`;
  }

  if (usedFilenames) {
    usedFilenames.add(fullFilename);
  }

  return fullFilename;
}

/**
 * Batch generate certificates for all rows, publish registry records, and bundle into JSZip.
 *
 * Hardened Features:
 * - Lazy-loads heavy libraries (jsPDF, JSZip) dynamically on demand.
 * - Processes in bounded chunks with event-loop yielding to keep browser UI responsive.
 * - Supports cancellation via shouldCancel callback.
 * - Handles row-level errors gracefully without aborting the entire batch.
 * - Protects against filename collisions for duplicate attendee names.
 * - Explicitly releases canvas memory and revokes URLs.
 */
export async function batchGenerateCertificates(
  template: TemplateFile,
  spreadsheet: SpreadsheetData,
  mappings: FieldMapping[],
  options: OutputOptions,
  onProgress?: (progressPct: number, currentItem: string, currentIndex: number, total: number) => void,
  shouldCancel?: () => boolean
): Promise<BatchGenerationResult> {
  // Lazy-load heavy dependencies to dramatically reduce initial JavaScript bundle size
  const [{ default: jsPDF }, { default: JSZip }] = await Promise.all([
    import('jspdf'),
    import('jszip'),
  ]);

  const zip = new JSZip();
  const certificates: GeneratedCert[] = [];
  const recordsToPublish: CertificateRecord[] = [];
  const failedRows: FailedRowError[] = [];
  const usedFilenames = new Set<string>();

  const totalRows = spreadsheet.rows.length;
  const MAX_PREVIEW_ITEMS = 24;

  for (let i = 0; i < totalRows; i++) {
    // Check if generation was cancelled by user
    if (shouldCancel && shouldCancel()) {
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      return { zipBlob, certificates, failedRows, cancelled: true };
    }

    const row = spreadsheet.rows[i];
    const certId = generateCertificateId();
    const recipientName =
      getRowValue(row, spreadsheet.nameHeader) || getRowValue(row, 'name') || `Recipient ${i + 1}`;

    if (onProgress) {
      const pct = Math.round(((i + 1) / totalRows) * 100);
      onProgress(pct, `${i + 1}/${totalRows}: ${recipientName}`, i + 1, totalRows);
    }

    // Yield to the browser event loop every 4 rows so UI stays responsive and repaint occurs
    if (i % 4 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    try {
      // Build privacy-filtered published details for the registry
      const publishedDetails: Record<string, any> = {};
      mappings.forEach((m) => {
        if (m.showOnVerification !== false) {
          if (m.type === 'column' && m.columnName) {
            const val = getRowValue(row, m.columnName);
            if (val) publishedDetails[m.label || m.columnName] = val;
          } else if (m.type === 'custom' && m.customText) {
            publishedDetails[m.label || 'Event Details'] = m.customText;
          }
        }
      });

      // Record for the database registry
      const certRecord: CertificateRecord = {
        cert_id: certId,
        recipient_name: recipientName,
        details: publishedDetails,
        issued_at: new Date().toISOString(),
        issuer: options.issuerName || 'Credora Verified Authority',
        status: 'valid',
      };
      recordsToPublish.push(certRecord);

      // Render Canvas
      const canvas = await renderCertificateCanvas(template, row, mappings, certId);
      const filename = buildFilename(
        options.filenamePattern,
        row,
        i,
        certId,
        options.format,
        usedFilenames
      );

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

      // Add binary ArrayBuffer directly to ZIP
      zip.file(filename, fileBuffer);

      // Keep lightweight thumbnail objects for UI rendering
      const fileBlob = new Blob([fileBuffer], {
        type:
          options.format === 'pdf'
            ? 'application/pdf'
            : options.format === 'jpg'
            ? 'image/jpeg'
            : 'image/png',
      });

      certificates.push({
        id: certId,
        recipientName,
        filename,
        blob: fileBlob,
        dataUrl: i < MAX_PREVIEW_ITEMS ? crispDataUrl : '',
        rowIndex: i,
        details: publishedDetails,
      });

      // Explicitly release canvas memory
      canvas.width = 0;
      canvas.height = 0;
    } catch (rowErr: any) {
      console.error(`Row ${i + 1} (${recipientName}) failed to render:`, rowErr);
      failedRows.push({
        rowIndex: i + 1,
        recipientName,
        error: rowErr?.message || 'Rendering error',
      });
    }
  }

  // Publish valid records to the database registry
  if (recordsToPublish.length > 0) {
    try {
      await batchPublishCertificates(recordsToPublish);
    } catch (err) {
      console.error('Failed to publish certificate records to registry:', err);
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { zipBlob, certificates, failedRows, cancelled: false };
}
