import { useState, useEffect } from 'react';
import type { AppStep, TemplateFile, SpreadsheetData, FieldMapping } from './types';
import { Header } from './components/Header';
import { UploadStep } from './components/UploadStep';
import { MappingStudioStep } from './components/MappingStudioStep';
import { GenerationStep } from './components/GenerationStep';
import { VerificationModal } from './components/VerificationModal';
import {
  getDefaultSampleTemplate,
  SAMPLE_SPREADSHEET,
  getDefaultFieldMappings,
} from './utils/sampleData';

export function App() {
  const [currentStep, setStep] = useState<AppStep>('upload');
  const [template, setTemplate] = useState<TemplateFile | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    certId: '',
    recipientName: '',
  });

  // Check URL query parameters for scanned QR verification codes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyId = params.get('verify');
      const recipient = params.get('name') || params.get('recipient') || 'Certificate Holder';

      if (verifyId) {
        setVerificationModal({
          isOpen: true,
          certId: verifyId,
          recipientName: recipient,
        });
      }
    }
  }, []);

  // Toggle dark class on <html> document element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Quick Demo Sample Loader
  const handleLoadSample = () => {
    const sampleTpl = getDefaultSampleTemplate();
    const sampleSheet = SAMPLE_SPREADSHEET;
    const sampleMappings = getDefaultFieldMappings();

    setTemplate(sampleTpl);
    setSpreadsheet(sampleSheet);
    setMappings(sampleMappings);
    setStep('mapping');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fefce8] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans selection:bg-yellow-300 selection:text-black">
      
      {/* Top Brutalist Header Bar */}
      <Header
        currentStep={currentStep}
        setStep={setStep}
        onLoadSample={handleLoadSample}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        hasTemplate={!!template}
        hasSpreadsheet={!!spreadsheet}
        onOpenVerification={(certId) =>
          setVerificationModal({
            isOpen: true,
            certId: (certId || '').trim().toUpperCase(),
            recipientName: '',
          })
        }
      />

      {/* Main Workspace Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 'upload' && (
          <UploadStep
            template={template}
            setTemplate={setTemplate}
            spreadsheet={spreadsheet}
            setSpreadsheet={setSpreadsheet}
            onProceed={() => setStep('mapping')}
            onLoadSample={handleLoadSample}
            onOpenVerification={(certId) =>
              setVerificationModal({
                isOpen: true,
                certId: (certId || '').trim().toUpperCase(),
                recipientName: '',
              })
            }
          />
        )}

        {currentStep === 'mapping' && template && spreadsheet && (
          <MappingStudioStep
            template={template}
            spreadsheet={spreadsheet}
            mappings={mappings}
            setMappings={setMappings}
            onProceed={() => setStep('generate')}
            onBack={() => setStep('upload')}
          />
        )}

        {currentStep === 'generate' && template && spreadsheet && (
          <GenerationStep
            template={template}
            spreadsheet={spreadsheet}
            mappings={mappings}
            onBack={() => setStep('mapping')}
            onOpenVerification={(certId, recipientName) =>
              setVerificationModal({ isOpen: true, certId, recipientName })
            }
          />
        )}
      </main>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ ...verificationModal, isOpen: false })}
        certId={verificationModal.certId}
        recipientName={verificationModal.recipientName}
      />

      {/* Footer */}
      <footer className="py-5 border-t-4 border-black dark:border-slate-800 bg-yellow-300 dark:bg-slate-900 text-black dark:text-white px-6 font-mono text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black">
            <span>CREDORA</span> — BULK CERTIFICATE GENERATOR
          </div>
          <p className="font-bold">© 2026 CREDORA INC. 100% PRIVATE & BROWSER-LOCAL.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
