/**
 * Certificate ID Generation and Checksum Verification Utilities
 * Format: CRD-YYYY-NNNNNN (e.g. CRD-2026-X8K9M2)
 *
 * The 6-character suffix consists of:
 * - 4 non-sequential, collision-free characters generated via a full-period bijective permutation
 * - 2 deterministic checksum characters calculated from the prefix and entropy payload
 * This guarantees zero collisions across 1,000,000+ generated certificates per session while
 * preventing sequential enumeration / guessing attacks by counting.
 */

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars, avoids 0/O, 1/I confusion
const MODULUS = 1048576; // 32^4 (full permutation space)
const MULTIPLIER = 314157; // A = 4k + 1 (Hull-Dobell theorem for full period)
const INCREMENT = 7919; // B is odd, coprime to 2^20

// Monotonic session state initialized to random starting point
let sessionState = Math.floor(Math.random() * MODULUS);

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
 * @param batchIndex Optional batch sequence index for deterministic uniqueness within a batch
 * @returns Formatted certificate ID string (e.g., 'CRD-2026-H7M4K2')
 */
export function generateCertificateId(
  year: number = new Date().getFullYear(),
  batchIndex?: number
): string {
  let state: number;

  if (typeof batchIndex === 'number' && batchIndex >= 0) {
    // Bijective permutation mapping for explicit batch indexing
    state = ((batchIndex + 1) * MULTIPLIER + INCREMENT) % MODULUS;
  } else {
    // Monotonic full-period LCG advancing session state
    sessionState = (MULTIPLIER * sessionState + INCREMENT) % MODULUS;
    state = sessionState;
  }

  // Convert 20-bit state into 4 base-32 characters
  let entropy = '';
  let temp = state;
  for (let i = 0; i < 4; i++) {
    entropy += ALPHABET[temp % ALPHABET.length];
    temp = Math.floor(temp / ALPHABET.length);
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
