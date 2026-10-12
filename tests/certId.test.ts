import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateCertificateId, validateCertificateIdFormat } from '../src/utils/certId.ts';

describe('Certificate ID Generation and Checksum Validation', () => {
  it('generates certificate IDs adhering strictly to the CRD-YYYY-NNNNNN format', () => {
    const certId = generateCertificateId(2026);
    assert.match(certId, /^CRD-2026-[2-9A-HJ-NP-Z]{6}$/);
    assert.equal(certId.length, 15);
  });

  it('validates genuine generated certificate IDs as valid', () => {
    for (let i = 0; i < 100; i++) {
      const id = generateCertificateId();
      assert.equal(
        validateCertificateIdFormat(id),
        true,
        `Expected ${id} to be valid`
      );
    }
  });

  it('rejects malformed, empty, or non-string inputs', () => {
    assert.equal(validateCertificateIdFormat(''), false);
    assert.equal(validateCertificateIdFormat('CRD-2026'), false);
    assert.equal(validateCertificateIdFormat('CRD-2026-INVALIDLENGTH'), false);
    assert.equal(validateCertificateIdFormat('CERT-2026-ABCDEF'), false);
    assert.equal(validateCertificateIdFormat('CRD-2026-01ILXX'), false); // Disallowed ambiguous characters (0, 1, I, L)
    assert.equal(validateCertificateIdFormat(null as any), false);
    assert.equal(validateCertificateIdFormat(undefined as any), false);
  });

  it('detects single-character tampering via checksum verification', () => {
    const validId = generateCertificateId(2026);
    assert.equal(validateCertificateIdFormat(validId), true);

    // Tamper with the entropy payload
    const parts = validId.split('-');
    const suffix = parts[2];
    const tamperedChar = suffix[0] === 'A' ? 'B' : 'A';
    const tamperedId = `CRD-${parts[1]}-${tamperedChar}${suffix.slice(1)}`;

    // Tampered ID should fail checksum verification
    assert.equal(
      validateCertificateIdFormat(tamperedId),
      false,
      `Tampered ID ${tamperedId} must be rejected by checksum`
    );
  });

  it('detects checksum character tampering', () => {
    const validId = generateCertificateId(2026);
    // Alter the last character (which is part of the checksum)
    const lastChar = validId[validId.length - 1];
    const replacement = lastChar === 'Z' ? 'Y' : 'Z';
    const altered = validId.slice(0, -1) + replacement;

    assert.equal(
      validateCertificateIdFormat(altered),
      false,
      `Altered checksum ID ${altered} must be rejected`
    );
  });

  it('guarantees uniqueness across a large batch of 10,000 generated IDs', () => {
    const count = 10000;
    const generated = new Set<string>();

    for (let i = 0; i < count; i++) {
      const id = generateCertificateId(2026);
      assert.equal(
        generated.has(id),
        false,
        `Collision detected on ID ${id} at iteration ${i}`
      );
      generated.add(id);
    }

    assert.equal(generated.size, count);
  });
});
