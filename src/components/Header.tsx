import React from 'react';
import { Award, Zap, Moon, Sun, Search, Check } from 'lucide-react';
import type { AppStep } from '../types';

interface HeaderProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  onLoadSample: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  hasTemplate: boolean;
  hasSpreadsheet: boolean;
  onOpenVerification?: (certId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  setStep,
  onLoadSample,
  darkMode,
  setDarkMode,
  hasTemplate,
  hasSpreadsheet,
  onOpenVerification,
}) => {
  const steps: { id: AppStep; label: string; number: number }[] = [
    { id: 'upload', label: 'Upload Files', number: 1 },
    { id: 'mapping', label: 'Map Fields', number: 2 },
    { id: 'generate', label: 'Export ZIP', number: 3 },
  ];

  const currentStepIndex = currentStep === 'complete' ? 2 : steps.findIndex((s) => s.id === currentStep);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Mobile Row */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <button
            onClick={() => setStep('upload')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-yellow-400 rounded-lg"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-400 text-slate-950 font-black border-2 border-slate-950">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                CREDORA
              </span>
              <span className="hidden sm:block text-xs font-medium text-slate-600 dark:text-slate-400">
                Bulk Certificate Studio
              </span>
            </div>
          </button>

          {/* Quick Actions on Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {onOpenVerification && (
              <button
                type="button"
                onClick={() => onOpenVerification()}
                className="min-h-[44px] min-w-[44px] px-3 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5"
                title="Verify a certificate by ID"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Multi-Step Flow Indicator */}
        <nav aria-label="Progress" className="w-full md:w-auto flex items-center justify-center overflow-x-auto py-1">
          <ol className="flex items-center gap-1 sm:gap-2">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id || (currentStep === 'complete' && step.id === 'generate');
              const isPast = idx < currentStepIndex;
              const isDisabled =
                (step.id === 'mapping' && (!hasTemplate || !hasSpreadsheet)) ||
                (step.id === 'generate' && (!hasTemplate || !hasSpreadsheet));

              return (
                <li key={step.id} className="flex items-center">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setStep(step.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-mono font-bold border-2 transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-yellow-400 text-slate-950 border-slate-950 font-black'
                        : isPast
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-600 dark:border-emerald-700 hover:bg-emerald-100'
                        : isDisabled
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? 'bg-slate-950 text-yellow-400'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                    </span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>

                  {idx < steps.length - 1 && (
                    <div className="w-3 sm:w-6 h-0.5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={onLoadSample}
            className="min-h-[44px] px-3.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Load Demo</span>
          </button>

          {onOpenVerification && (
            <button
              type="button"
              onClick={() => onOpenVerification()}
              className="min-h-[44px] px-3.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              title="Verify a certificate by certificate number"
            >
              <Search className="w-4 h-4" />
              <span>Verify by ID</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
};
