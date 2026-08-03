import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certId: string;
  recipientName: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  certId,
  recipientName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono">
      <div className="brutal-card max-w-md w-full p-6 space-y-6 bg-yellow-100 dark:bg-slate-900 border-4 border-black dark:border-slate-700 shadow-[8px_8px_0px_0px_#000000] text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-400 border-2 border-black text-black">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">CREDORA VERIFY</h3>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">verify.credora.app/{certId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded border-2 border-black dark:border-slate-700"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Verification Status Badge Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-center space-y-3 shadow-[3px_3px_0px_0px_#000000]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-300 text-black border-2 border-black">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 block">
              AUTHENTIC & VERIFIED CERTIFICATE
            </span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
              {recipientName}
            </h4>
          </div>

          <div className="pt-2 border-t-2 border-black dark:border-slate-700 grid grid-cols-2 gap-2 text-left text-xs font-bold">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">ISSUED BY</span>
              <span className="text-slate-900 dark:text-white">Credora Org</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">SECURITY STAMP</span>
              <span className="text-indigo-600 dark:text-yellow-300 font-black">{certId.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Trust Callout */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-300 text-black border-2 border-black font-bold text-[11px]">
          <Lock className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>
            Digital certificate cryptographically verified & immutable.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 brutal-btn-yellow text-xs font-black uppercase text-black"
        >
          CLOSE VERIFICATION WINDOW
        </button>

      </div>
    </div>
  );
};
