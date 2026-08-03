import React from 'react';
import { Award, Zap, Moon, Sun, ShieldCheck } from 'lucide-react';
import type { AppStep } from '../types';

interface HeaderProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  onLoadSample: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  hasTemplate: boolean;
  hasSpreadsheet: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  setStep,
  onLoadSample,
  darkMode,
  setDarkMode,
  hasTemplate,
  hasSpreadsheet,
}) => {
  const steps: { id: AppStep; label: string; number: number }[] = [
    { id: 'upload', label: '1. UPLOAD', number: 1 },
    { id: 'mapping', label: '2. MAP FIELDS', number: 2 },
    { id: 'generate', label: '3. EXPORT ZIP', number: 3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-yellow-100/90 dark:bg-slate-900/90 backdrop-blur-md border-b-4 border-black dark:border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brutalist Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setStep('upload')}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-300 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black font-black">
            <Award className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono tracking-wider text-slate-900 dark:text-white uppercase">
                CREDORA
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-300 text-black border-2 border-black">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Brutalist Stepper */}
        <nav className="flex items-center gap-2">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id || (currentStep === 'complete' && step.id === 'generate');
            const isDisabled =
              (step.id === 'mapping' && (!hasTemplate || !hasSpreadsheet)) ||
              (step.id === 'generate' && (!hasTemplate || !hasSpreadsheet));

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <span className="font-mono font-black text-slate-900 dark:text-white">➔</span>}
                <button
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setStep(step.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-black border-2 border-black transition-all ${
                    isActive
                      ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_#000000]'
                      : isDisabled
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed border-slate-400 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_#000000]'
                  }`}
                >
                  {step.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLoadSample}
            className="px-3.5 py-1.5 rounded-lg brutal-btn-cyan text-xs font-mono flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>TRY DEMO SAMPLE</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>100% PRIVATE</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-black dark:border-slate-700 shadow-[2px_2px_0px_0px_#000000]"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-slate-900" />}
          </button>
        </div>

      </div>
    </header>
  );
};
