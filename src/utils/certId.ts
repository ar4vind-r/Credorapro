/**
 * Certificate ID Generation and Checksum Verification Utilities
 * Format: CRD-YYYY-NNNNNN (e.g. CRD-2026-X8K9M2)
 *
 * The 6-character suffix consists of:
 * - 4 high-entropy characters from an unambiguous alphanumeric alphabet
 * - 2 deterministic checksum characters calculated from the prefix and entropy payload
 * This prevents sequential enumeration / guessing attacks by counting.
 */

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 31 chars, avoids 0/O, 1/I/L confusion

/**
 * Computes a 2-character checksum for a given seed string using a dual-polynomial hash.
 */
function computeChecksum(input: string): string {
  let hash1 = 5381;
  let hash2 = 0;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ code;
    hash2 = (hash2 * 31 + code) >>> 0;
  }

  const char1 = ALPHABET[Math.abs(hash1) % ALPHABET.length];
  const char2 = ALPHABET[Math.abs(hash2) % ALPHABET.length];

  return `${char1}${char2}`;
}

/**
 * Generates a non-sequential, checksummed Certificate ID in the format CRD-YYYY-NNNNNN.
 *
 * @param year Optional 4-digit year (defaults to current year)
 * @returns Formatted certificate ID string (e.g., 'CRD-2026-H7M4K2')
 */
export function generateCertificateId(year: number = new Date().getFullYear()): string {
  // Generate 4 randomized entropy characters
  let entropy = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    entropy += ALPHABET[randomIndex];
  }

  const payload = `CRD-${year}-${entropy}`;
  const checksum = computeChecksum(payload);

  return `${payload}${checksum}`;
}

/**
 * Validates whether a certificate ID adheres to the CRD-YYYY-NNNNNN format and matches its checksum.
 *
 * @param certId Candidate certificate ID string
 * @returns true if format and checksum match, false otherwise
 */
export function validateCertificateIdFormat(certId: string): boolean {
  if (!certId || typeof certId !== 'string') return false;

  const normalized = certId.trim().toUpperCase();
  const match = normalized.match(/^CRD-(\d{4})-([2-9A-HJ-NP-Z]{4})([2-9A-HJ-NP-Z]{2})$/);
  if (!match) return false;

  const [, year, entropy, expectedChecksum] = match;
  const payload = `CRD-${year}-${entropy}`;
  const calculatedChecksum = computeChecksum(payload);

  return expectedChecksum === calculatedChecksum;
}
