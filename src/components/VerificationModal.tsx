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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm font-mono overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Mobile-first modal container: 360px - 430px optimal */}
      <div className="w-full max-w-[430px] my-auto brutal-card bg-yellow-50 dark:bg-slate-900 border-4 border-black dark:border-slate-700 shadow-[8px_8px_0px_0px_#000000] p-4 sm:p-6 text-slate-900 dark:text-white space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-300 border-2 border-black text-black">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-sm uppercase tracking-wider block">
                CREDORA REGISTRY
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">
                OFFICIAL CERTIFICATE VERIFICATION
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-black dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-200 dark:hover:bg-red-950 text-slate-900 dark:text-white transition-colors"
            title="Close Verification Window"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* =========================================================================
            STATE 1: LOADING SKELETON
           ========================================================================= */}
        {state.status === 'loading' && (
          <div className="space-y-4 py-2 animate-pulse">
            {/* Status Skeleton */}
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg border-2 border-black/40" />

            {/* Recipient Name Skeleton */}
            <div className="space-y-2 p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black/40">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mt-2" />
            </div>

            {/* Details Skeleton */}
            <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-800 border-2 border-black/40">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>

            <div className="text-center text-xs font-bold text-slate-600 dark:text-slate-400">
              Querying certificate registry for {state.certId}...
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: FOUND & VALID (MOBILE-FIRST: STATUS -> NAME -> CERT NO -> DETAILS)
           ========================================================================= */}
        {state.status === 'valid' && (
          <div className="space-y-4">
            
            {/* 1. STATUS FIRST */}
            <div className="p-3 rounded-xl bg-emerald-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-black text-emerald-300 shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-black/80">
                  OFFICIAL STATUS
                </span>
                <span className="text-base font-black uppercase tracking-wider block">
                  CERTIFICATE VERIFIED
                </span>
              </div>
            </div>

            {/* 2. RECIPIENT NAME IN LARGE TYPE */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-center space-y-1 shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                ISSUED TO RECIPIENT
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white break-words">
                {state.cert.recipient_name}
              </h2>

              {/* 3. CERTIFICATE NUMBER */}
              <div className="pt-2 flex items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-300 text-black border-2 border-black font-black text-xs">
                  <Hash className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{state.cert.cert_id}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(state.cert.cert_id)}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border-2 border-black text-slate-900 dark:text-white"
                  title="Copy Certificate ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. REMAINING DETAILS: ISSUER, ISSUE DATE & PUBLISHED COLUMNS */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 space-y-2.5 shadow-[2px_2px_0px_0px_#000000] text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b-2 border-black/10 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                    <Building className="w-3 h-3" /> ISSUED BY
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {state.cert.issuer || 'Credora Verified Authority'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1">
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
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">
                    PUBLISHED CREDENTIAL DETAILS
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {Object.entries(state.cert.details).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-black/20 dark:border-slate-700 text-[11px]"
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

            {/* Cryptographic Trust Seal */}
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 border-2 border-black dark:border-emerald-700 text-[11px] font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>Record verified directly against official database registry.</span>
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 3: REVOKED (STATUS FIRST -> REASON -> RECIPIENT -> CERT NO)
           ========================================================================= */}
        {state.status === 'revoked' && (
          <div className="space-y-4">
            
            {/* 1. STATUS FIRST */}
            <div className="p-3 rounded-xl bg-red-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-black text-red-400 shrink-0">
                <AlertOctagon className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-black/80">
                  CRITICAL WARNING
                </span>
                <span className="text-base font-black uppercase tracking-wider block">
                  CERTIFICATE REVOKED
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/50 border-2 border-red-600 text-red-900 dark:text-red-200 text-xs font-bold space-y-1">
              <p>This certificate was revoked by the issuing authority and is no longer valid.</p>
              {state.cert.revoked_reason && (
                <p className="font-black">Reason: {state.cert.revoked_reason}</p>
              )}
            </div>

            {/* 2. RECIPIENT & CERT ID */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-center space-y-1 shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">
                ORIGINAL RECIPIENT
              </span>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white line-through opacity-75">
                {state.cert.recipient_name}
              </h2>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-black font-mono font-bold text-xs">
                  {state.cert.cert_id}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Issued: {formatDate(state.cert.issued_at)} by {state.cert.issuer}
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 4: NOT FOUND (EXPLICIT NON-GREEN ERROR WITH NUMBER RE-ENTRY)
           ========================================================================= */}
        {state.status === 'not_found' && (
          <div className="space-y-4">
            
            {/* Status First - Amber/Rose Brutal Alert */}
            <div className="p-3 rounded-xl bg-rose-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-black text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-black/80">
                  REGISTRY LOOKUP FAILED
                </span>
                <span className="text-sm font-black uppercase tracking-wider block">
                  NO CERTIFICATE WITH THIS NUMBER EXISTS
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                No issued record was found in the official database matching:
              </p>
              <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 border-2 border-black font-mono font-black text-xs text-center text-rose-600 dark:text-rose-400 uppercase">
                {state.certId}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Please double-check the certificate number on the physical document or QR code and re-enter it below.
              </p>
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 5: NETWORK ERROR (WITH RETRY BUTTON)
           ========================================================================= */}
        {state.status === 'network_error' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-black text-amber-300 shrink-0">
                <WifiOff className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-black/80">
                  CONNECTION FAILED
                </span>
                <span className="text-sm font-black uppercase tracking-wider block">
                  STATUS COULD NOT BE CHECKED
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-xs font-bold space-y-2">
              <p className="text-slate-700 dark:text-slate-300">
                The verification registry could not be reached. Please verify your internet connection.
              </p>
              <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 border border-black/30 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                {state.error}
              </div>
            </div>

            <button
              type="button"
              onClick={() => executeLookup(state.certId)}
              className="w-full py-2.5 brutal-btn-yellow text-xs font-black uppercase text-black flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 stroke-[3]" />
              <span>RETRY VERIFICATION</span>
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
            
            {/* Fallback Notice Badge - Neutral Amber/Slate, NOT Green */}
            <div className="p-3 rounded-xl bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-black text-amber-300 shrink-0">
                <Info className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-black tracking-widest block text-black/80">
                  NOTICE
                </span>
                <span className="text-xs font-black uppercase tracking-wider block">
                  DETAILS READ FROM QR CODE — NOT INDEPENDENTLY VERIFIED
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-center space-y-2 shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">
                RECIPIENT NAME (FROM QR / SESSION)
              </span>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">
                {state.recipientName || 'Certificate Holder'}
              </h2>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border-2 border-black text-xs font-mono font-bold">
                  {state.certId}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-100/90 dark:bg-slate-800 border-2 border-black text-slate-800 dark:text-slate-300 text-[11px] font-bold">
              No cloud registry is currently connected. To enable cryptographic registry verification, configure Firebase Firestore in <code className="px-1 py-0.5 bg-white dark:bg-slate-900 border border-black rounded text-[10px]">.env</code>.
            </div>

          </div>
        )}

        {/* =========================================================================
            STATE 7: IDLE / RE-ENTRY SEARCH INPUT
            Allows searching or re-entering any certificate number
           ========================================================================= */}
        <div className="pt-3 border-t-2 border-black dark:border-slate-700">
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>VERIFY BY CERTIFICATE NUMBER</span>
              <span className="text-[9px] text-slate-500">e.g. CRD-2026-X8K9M2</span>
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="CRD-YYYY-NNNNNN"
                  className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-xs font-mono font-black tracking-wider uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <button
                type="submit"
                disabled={!searchQuery.trim() || state.status === 'loading'}
                className="px-4 py-2 brutal-btn-yellow text-xs font-black uppercase text-black disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                VERIFY
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Dismissal Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-black dark:border-slate-700 text-xs font-black uppercase text-slate-900 dark:text-white transition-colors"
        >
          CLOSE WINDOW
        </button>

      </div>
    </div>
  );
};
