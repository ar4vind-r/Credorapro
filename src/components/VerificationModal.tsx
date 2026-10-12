import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  Search,
  RefreshCw,
  X,
  Calendar,
  Building,
  Hash,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { lookupCertificate } from '../services/registry';
import type { VerificationState } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certId: string;
  recipientName?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  certId,
  recipientName,
}) => {
  const [searchQuery, setSearchQuery] = useState(certId || '');
  const [state, setState] = useState<VerificationState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  // Trigger lookup whenever modal opens or certId changes
  useEffect(() => {
    if (!isOpen) {
      setState({ status: 'idle' });
      return;
    }

    const trimmed = (certId || '').trim();
    setSearchQuery(trimmed);

    if (trimmed) {
      executeLookup(trimmed);
    } else {
      setState({ status: 'idle' });
    }
  }, [isOpen, certId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const executeLookup = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;

    setState({ status: 'loading', certId: cleanId });
    try {
      const result = await lookupCertificate(cleanId, recipientName);
      setState(result);
    } catch (err: any) {
      setState({
        status: 'network_error',
        error: err?.message || 'Failed to connect to verification registry.',
        certId: cleanId,
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeLookup(searchQuery);
    }
  };

  const handleCopyId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 font-mono overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Mobile-first modal container: 360px - 430px optimal */}
      <div className="w-full max-w-[430px] my-auto brutal-card bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-700 p-5 sm:p-6 text-slate-900 dark:text-white space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-400 border-2 border-slate-950 text-slate-950" aria-hidden="true">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span id="verification-dialog-title" className="font-extrabold text-sm uppercase tracking-wider block">
                Credora Registry
              </span>
              <span className="text-[10px] text-slate-500 font-bold block font-sans">
                Official Certificate Verification
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            title="Close Verification Window"
            aria-label="Close Verification Window"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* =========================================================================
            STATE 1: LOADING SKELETON
           ========================================================================= */}
        {state.status === 'loading' && (
          <div className="space-y-4 py-2">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-900/20" />
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-900/20 text-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mt-2" />
            </div>
            <div className="text-center text-xs font-bold text-slate-500">
              Querying official registry for {state.certId}...
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: FOUND & VALID (STATUS -> NAME -> CERT NO -> DETAILS)
           ========================================================================= */}
        {state.status === 'valid' && (
          <div className="space-y-4">
            
            {/* 1. STATUS FIRST */}
            <div className="p-3.5 rounded-xl bg-emerald-500 text-slate-950 border-2 border-slate-950 flex items-center gap-3">
              <div className="p-1 rounded-full bg-slate-950 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-slate-950/80">
                  Official Record Found
                </span>
                <span className="text-base font-black uppercase tracking-wider block">
                  Certificate Verified
                </span>
              </div>
            </div>

            {/* 2. RECIPIENT NAME IN LARGE TYPE */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Issued To Recipient
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white break-words">
                {state.cert.recipient_name}
              </h2>

              {/* 3. CERTIFICATE NUMBER */}
              <div className="pt-2 flex items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-400 text-slate-950 border-2 border-slate-950 font-black text-xs">
                  <Hash className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{state.cert.cert_id}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(state.cert.cert_id)}
                  className="min-h-[36px] min-w-[36px] p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border-2 border-slate-900 text-slate-900 dark:text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  title="Copy Certificate ID"
                  aria-label="Copy Certificate ID to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. DETAILS: ISSUER, ISSUE DATE & PUBLISHED COLUMNS */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b-2 border-slate-900/10 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block flex items-center gap-1">
                    <Building className="w-3 h-3" /> ISSUED BY
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {state.cert.issuer || 'Credora Verified Authority'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> ISSUE DATE
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {formatDate(state.cert.issued_at)}
                  </span>
                </div>
              </div>

              {/* Published Mapped Fields */}
              {state.cert.details && Object.keys(state.cert.details).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Published Credential Details
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {Object.entries(state.cert.details).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-900/20 dark:border-slate-700 text-[11px]"
                      >
                        <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0 uppercase">
                          {key}:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-right break-words">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* What this confirms & What to do next */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-600 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-xs font-sans space-y-1.5">
              <p>
                <strong className="font-mono uppercase text-[11px] block">What this confirms:</strong>
                This record was officially issued to <strong>{state.cert.recipient_name}</strong> by <strong>{state.cert.issuer}</strong> on <strong>{formatDate(state.cert.issued_at)}</strong>.
              </p>
              <p>
                <strong className="font-mono uppercase text-[11px] block">What to do next:</strong>
                Copy the certificate ID above or share the current browser link as authentic proof with employers and institutions.
              </p>
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 3: REVOKED (STATUS -> REASON -> RECIPIENT -> WHAT TO DO NEXT)
           ========================================================================= */}
        {state.status === 'revoked' && (
          <div className="space-y-4">
            
            <div className="p-3.5 rounded-xl bg-red-500 text-white border-2 border-slate-950 flex items-center gap-3">
              <div className="p-1 rounded-full bg-slate-950 text-red-400 shrink-0">
                <AlertOctagon className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-white/80">
                  Critical Warning
                </span>
                <span className="text-base font-black uppercase tracking-wider block">
                  Certificate Revoked
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center space-y-1 border-2 border-slate-900 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Originally Issued To
              </span>
              <h2 className="text-xl font-bold uppercase text-slate-900 dark:text-white line-through opacity-70">
                {state.cert.recipient_name}
              </h2>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-900 font-mono font-bold text-xs">
                  {state.cert.cert_id}
                </span>
              </div>
            </div>

            {/* What this confirms & What to do next */}
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border-2 border-red-600 text-red-950 dark:text-red-200 text-xs font-sans space-y-1.5">
              <p>
                <strong className="font-mono uppercase text-[11px] block text-red-700 dark:text-red-400">
                  Revocation Notice:
                </strong>
                This certificate was revoked by the issuing authority and is no longer valid.
                {state.cert.revoked_reason && ` Reason: ${state.cert.revoked_reason}`}
              </p>
              <p>
                <strong className="font-mono uppercase text-[11px] block text-red-700 dark:text-red-400">
                  What to do next:
                </strong>
                This document cannot be used as proof of achievement. Contact <strong>{state.cert.issuer}</strong> for questions or re-issuance.
              </p>
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 4: NOT FOUND (EXPLICIT NON-GREEN ERROR WITH NUMBER RE-ENTRY)
           ========================================================================= */}
        {state.status === 'not_found' && (
          <div className="space-y-4">
            
            <div className="p-3.5 rounded-xl bg-rose-500 text-white border-2 border-slate-950 flex items-center gap-3">
              <div className="p-1 rounded-full bg-slate-950 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-white/80">
                  Lookup Failed
                </span>
                <span className="text-sm font-black uppercase tracking-wider block">
                  No Certificate With This Number Exists
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 space-y-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                No issued record was found in the official database matching:
              </p>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border-2 border-slate-900 font-mono font-black text-xs text-center text-rose-600 dark:text-rose-400 uppercase">
                {state.certId}
              </div>

              <div className="text-xs font-sans text-slate-600 dark:text-slate-400 space-y-1">
                <strong className="font-mono uppercase text-[11px] block">What to do next:</strong>
                <p>
                  1. Check the physical certificate for typos (format: <code>CRD-YYYY-NNNNNN</code>).
                </p>
                <p>
                  2. Re-enter the correct number in the search input below.
                </p>
                <p>
                  3. If you just received this certificate, confirm with the event organizer that their batch was finalized.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 5: NETWORK ERROR (WITH RETRY BUTTON)
           ========================================================================= */}
        {state.status === 'network_error' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-slate-950 flex items-center gap-3">
              <div className="p-1 rounded-full bg-slate-950 text-amber-300 shrink-0">
                <WifiOff className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-slate-950/80">
                  Connection Error
                </span>
                <span className="text-sm font-black uppercase tracking-wider block">
                  Status Could Not Be Checked
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-sans space-y-2">
              <p className="text-slate-700 dark:text-slate-300">
                The verification registry could not be reached. Please check your internet connection.
              </p>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-900/30 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                {state.error}
              </div>
            </div>

            <button
              type="button"
              onClick={() => executeLookup(state.certId)}
              className="w-full min-h-[44px] brutal-btn-yellow text-xs font-black uppercase text-black flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              <span>Retry Verification</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 6: UNVERIFIED FALLBACK (WHEN NO BACKEND REGISTRY IS CONFIGURED)
            Rule 7: "Details read from QR code — not independently verified"
            Must NEVER use the words "authentic" or "verified".
           ========================================================================= */}
        {state.status === 'unverified_fallback' && (
          <div className="space-y-4">
            
            <div className="p-3.5 rounded-xl bg-amber-300 text-slate-950 border-2 border-slate-950 flex items-center gap-3">
              <div className="p-1 rounded-full bg-slate-950 text-amber-300 shrink-0">
                <Info className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-slate-950/80">
                  Notice
                </span>
                <span className="text-xs font-black uppercase tracking-wider block">
                  Details Read From QR Code — Not Independently Verified
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Holder Name
              </span>
              <h2 className="text-xl font-bold uppercase text-slate-900 dark:text-white">
                {state.recipientName || 'Certificate Holder'}
              </h2>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-900 font-mono text-xs">
                  {state.certId}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 text-slate-800 dark:text-slate-300 text-xs font-sans">
              No cloud registry is connected to independently corroborate this record. Configure Firebase Firestore in <code>.env</code> to activate verification.
            </div>

          </div>
        )}

        {/* =========================================================================
            RE-ENTRY SEARCH INPUT (MIN 44PX TOUCH TARGET)
           ========================================================================= */}
        <div className="pt-3 border-t-2 border-slate-900/10 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label htmlFor="modal-cert-search-input" className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Verify by Certificate Number</span>
              <span className="text-[9px] text-slate-500">e.g. CRD-2026-X8K9M2</span>
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="modal-cert-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="CRD-YYYY-NNNNNN"
                  aria-label="Certificate number to verify"
                  className="min-h-[44px] w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <button
                type="submit"
                disabled={!searchQuery.trim() || state.status === 'loading'}
                className="min-h-[44px] px-4 py-2 brutal-btn-yellow text-xs font-black uppercase text-black disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Verify
              </button>
            </div>
          </form>
        </div>

        {/* Dismissal Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold uppercase text-slate-900 dark:text-white transition-colors"
        >
          Close Window
        </button>

      </div>
    </div>
  );
};
