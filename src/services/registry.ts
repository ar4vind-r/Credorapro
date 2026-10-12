import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';
import type { CertificateRecord, VerificationState } from '../types';

const COLLECTION_NAME = 'certificates';
const LOCAL_STORAGE_KEY = 'credora_local_registry_v1';

/**
 * Retrieves the local fallback registry stored in localStorage.
 */
function getLocalFallbackRecords(): Record<string, CertificateRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Saves records to the local fallback registry.
 */
function saveLocalFallbackRecords(records: Record<string, CertificateRecord>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save to local fallback registry:', err);
  }
}

/**
 * Publishes a single certificate record to the Firestore registry.
 */
export async function publishCertificate(record: CertificateRecord): Promise<void> {
  const db = getFirebaseFirestore();

  // Always keep a local copy for the session
  const local = getLocalFallbackRecords();
  local[record.cert_id] = record;
  saveLocalFallbackRecords(local);

  if (!db) {
    console.info('Firebase not configured. Stored certificate in local session registry.');
    return;
  }

  const certRef = doc(db, COLLECTION_NAME, record.cert_id);
  await setDoc(certRef, record);
}

/**
 * Publishes a batch of certificate records to the Firestore registry using chunked batches.
 */
export async function batchPublishCertificates(records: CertificateRecord[]): Promise<void> {
  if (records.length === 0) return;

  // Always update local session copy
  const local = getLocalFallbackRecords();
  records.forEach((r) => {
    local[r.cert_id] = r;
  });
  saveLocalFallbackRecords(local);

  const db = getFirebaseFirestore();
  if (!db) {
    console.info('Firebase not configured. Stored batch in local session registry.');
    return;
  }

  // Firestore allows up to 500 operations per batch
  const CHUNK_SIZE = 400;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const record of chunk) {
      const certRef = doc(db, COLLECTION_NAME, record.cert_id);
      batch.set(certRef, record);
    }

    await batch.commit();
  }
}

/**
 * Looks up a certificate record by its exact certificate number.
 * Public read by exact cert_id only (no collection listing).
 *
 * Handles:
 * - Found and valid -> status: 'valid'
 * - Found and revoked -> status: 'revoked'
 * - Not found -> status: 'not_found'
 * - Network or permission failure -> status: 'network_error'
 * - No cloud backend configured -> status: 'unverified_fallback'
 */
export async function lookupCertificate(
  rawCertId: string,
  fallbackRecipientName?: string
): Promise<VerificationState> {
  const certId = (rawCertId || '').trim().toUpperCase();
  if (!certId) {
    return { status: 'idle' };
  }

  const db = getFirebaseFirestore();

  // If no cloud backend is configured:
  if (!db || !isFirebaseConfigured()) {
    // Check if the record exists in the local session registry
    const local = getLocalFallbackRecords();
    const localRecord = local[certId];

    if (localRecord) {
      // If found in local session storage, we return unverified_fallback stating it is not independently verified
      return {
        status: 'unverified_fallback',
        certId,
        recipientName: localRecord.recipient_name || fallbackRecipientName,
      };
    }

    // If completely unknown even locally
    return {
      status: 'unverified_fallback',
      certId,
      recipientName: fallbackRecipientName,
    };
  }

  // Cloud Firestore lookup
  try {
    const certRef = doc(db, COLLECTION_NAME, certId);
    const snapshot = await getDoc(certRef);

    if (!snapshot.exists()) {
      return {
        status: 'not_found',
        certId,
      };
    }

    const data = snapshot.data() as CertificateRecord;

    if (data.status === 'revoked') {
      return {
        status: 'revoked',
        cert: data,
      };
    }

    return {
      status: 'valid',
      cert: data,
    };
  } catch (err: any) {
    console.error('Certificate verification registry error:', err);
    return {
      status: 'network_error',
      error: err.message || 'Unable to connect to verification registry. Please check your network.',
      certId,
    };
  }
}
