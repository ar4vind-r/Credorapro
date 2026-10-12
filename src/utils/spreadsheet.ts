import type { SpreadsheetData, SpreadsheetRow } from '../types';

export const COMMON_NAME_HEADERS = [
  'name',
  'full_name',
  'fullname',
  'student_name',
  'recipient',
  'person',
  'attendee_name',
];

/**
 * Automatically identifies the column header that represents recipient name.
 */
export function detectNameColumn(headers: string[]): string | undefined {
  if (!headers || headers.length === 0) return undefined;
  
  const match = headers.find((h) =>
    COMMON_NAME_HEADERS.includes(h.toLowerCase().trim().replace(/[\s_-]+/g, '_'))
  );
  
  return match || headers[0];
}

export interface ValidationSuccess {
  success: true;
  data: SpreadsheetData;
  warnings?: string[];
}

export interface ValidationFailure {
  success: false;
  error: string;
}

export type SpreadsheetValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates spreadsheet structure, column headers, and row data.
 * Checks for:
 * - Empty rows (pruned automatically)
 * - Zero remaining data rows
 * - Missing name column or empty recipient name values (reporting exact 1-indexed row number)
 * - Duplicate recipient names (flagged as non-fatal warning)
 */
export function validateSpreadsheet(
  fileName: string,
  headers: string[],
  rawRows: Record<string, any>[]
): SpreadsheetValidationResult {
  if (!headers || headers.length === 0) {
    return {
      success: false,
      error: 'The spreadsheet has no valid column headers. Ensure row 1 contains headers.',
    };
  }

  // Filter out completely blank rows
  const rows: SpreadsheetRow[] = rawRows
    .map((r) => {
      const sanitized: SpreadsheetRow = {};
      for (const [key, val] of Object.entries(r)) {
        if (key && key.trim()) {
          sanitized[key.trim()] = val !== null && val !== undefined ? String(val).trim() : '';
        }
      }
      return sanitized;
    })
    .filter((r) => Object.values(r).some((val) => String(val || '').trim() !== ''));

  if (rows.length === 0) {
    return {
      success: false,
      error: 'No attendee rows found in spreadsheet. Ensure data rows exist beneath the header row.',
    };
  }

  const nameHeader = detectNameColumn(headers);
  if (!nameHeader) {
    return {
      success: false,
      error: 'Could not detect column titles. Ensure the first row of your spreadsheet contains column headers.',
    };
  }

  // Validate that every attendee row has a valid name
  const seenNames = new Set<string>();
  const duplicateNames: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowVal = String(rows[i][nameHeader] || '').trim();
    if (!rowVal) {
      return {
        success: false,
        error: `Row ${i + 2} has no recipient name under column '${nameHeader}'. Fix it in your spreadsheet and re-upload.`,
      };
    }

    const lower = rowVal.toLowerCase();
    if (seenNames.has(lower)) {
      duplicateNames.push(rowVal);
    } else {
      seenNames.add(lower);
    }
  }

  const warnings: string[] = [];
  if (duplicateNames.length > 0) {
    warnings.push(
      `Found ${duplicateNames.length} duplicate recipient name(s) (e.g. "${duplicateNames[0]}"). Each will receive a unique certificate ID and filename.`
    );
  }

  return {
    success: true,
    data: {
      fileName,
      headers: headers.map((h) => h.trim()).filter(Boolean),
      rows,
      nameHeader,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
