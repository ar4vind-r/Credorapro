import React, { useState } from 'react';
import {
  Download,
  Zap,
  RefreshCcw,
  CheckCircle2,
  Eye,
  ShieldCheck,
  ChevronLeft,
  Settings,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveAs } from 'file-saver';
import type {
  TemplateFile,
  SpreadsheetData,
  FieldMapping,
  OutputOptions,
  GeneratedCert,
} from '../types';
import { batchGenerateCertificates } from '../utils/generator';

interface GenerationStepProps {
  template: TemplateFile;
  spreadsheet: SpreadsheetData;
  mappings: FieldMapping[];
  onBack: () => void;
  onOpenVerification: (certId: string, recipient: string) => void;
}

export const GenerationStep: React.FC<GenerationStepProps> = ({
  template,
  spreadsheet,
  mappings,
  onBack,
  onOpenVerification,
}) => {
  const [options, setOptions] = useState<OutputOptions>({
    format: 'pdf',
    filenamePattern: '{{name}}_Certificate',
    pdfOrientation: 'landscape',
    imageQuality: 0.95,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{
    zipBlob: Blob;
    certificates: GeneratedCert[];
  } | null>(null);

  const [previewCert, setPreviewCert] = useState<GeneratedCert | null>(null);

  // Trigger batch generation
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedResult(null);

    try {
      const result = await batchGenerateCertificates(
        template,
        spreadsheet,
        mappings,
        options,
        (pct, item) => {
          setProgress(pct);
          setCurrentItem(item);
        }
      );

      setGeneratedResult(result);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#22d3ee', '#a3e635', '#000000'],
      });
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download ZIP bundle
  const handleDownloadZip = () => {
    if (!generatedResult) return;
    const zipName = `Credora_Certificates_${Date.now()}.zip`;
    saveAs(generatedResult.zipBlob, zipName);
  };

  // Download individual certificate file
  const handleDownloadSingle = (cert: GeneratedCert) => {
    saveAs(cert.blob, cert.filename);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-mono text-slate-900 dark:text-slate-100">
      
      {/* Header Title Card */}
      <div className="brutal-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-yellow-300 dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            EXPORT BATCH CERTIFICATES
          </h1>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
            Ready to render <span className="underline">{spreadsheet.rows.length}</span> recipient certificates.
          </p>
        </div>

        {generatedResult && (
          <button
            onClick={handleDownloadZip}
            className="brutal-btn-cyan px-6 py-2.5 text-xs font-black uppercase shrink-0 flex items-center gap-2 text-black"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>DOWNLOAD ZIP BUNDLE ({generatedResult.certificates.length})</span>
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {!generatedResult && (
        <div className="brutal-card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black dark:border-slate-700 pb-3">
            <Settings className="w-4 h-4 text-slate-900 dark:text-yellow-300 stroke-[2.5]" />
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">
              EXPORT OUTPUT SETTINGS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-slate-200">FILE FORMAT:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['pdf', 'png', 'jpg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOptions({ ...options, format: fmt })}
                    className={`py-2 rounded-lg font-mono text-xs font-black uppercase border-2 border-black dark:border-slate-700 transition-all ${
                      options.format === fmt
                        ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Naming Pattern */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-slate-200">NAMING PATTERN:</label>
              <input
                type="text"
                value={options.filenamePattern}
                onChange={(e) => setOptions({ ...options, filenamePattern: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                placeholder="{{name}}_Certificate"
              />
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">Placeholders: &#123;&#123;name&#125;&#125;, &#123;&#123;course&#125;&#125;</p>
            </div>

            {/* Resolution Quality */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-slate-200">RESOLUTION QUALITY:</label>
              <select
                value={options.imageQuality}
                onChange={(e) => setOptions({ ...options, imageQuality: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value={1.0} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">MAXIMUM QUALITY (100%)</option>
                <option value={0.92} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">BALANCED QUALITY (92%)</option>
                <option value={0.80} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">COMPACT COMPRESSED (80%)</option>
              </select>
            </div>

          </div>

          <div className="pt-2">
            <button
              disabled={isGenerating}
              onClick={handleStartGeneration}
              className="w-full py-3.5 brutal-btn-yellow text-xs font-black uppercase flex items-center justify-center gap-2 text-black"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>GENERATE ALL CERTIFICATES ({spreadsheet.rows.length} FILES)</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isGenerating && (
        <div className="brutal-card p-6 text-center space-y-4 animate-pulse bg-cyan-100 dark:bg-slate-900 border-2 border-black dark:border-slate-700">
          <div className="inline-flex p-3 rounded-xl bg-yellow-300 border-2 border-black text-black">
            <RefreshCcw className="w-6 h-6 animate-spin stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
              RENDERING CERTIFICATES... ({progress}%)
            </h3>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-cyan-300">
              Processing: {currentItem}
            </p>
          </div>

          <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-black dark:border-slate-700 max-w-md mx-auto p-0.5">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-yellow-300 border border-black rounded-sm transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Results Grid */}
      {generatedResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                GENERATED {generatedResult.certificates.length} CERTIFICATES
              </h2>
            </div>

            <button
              onClick={handleDownloadZip}
              className="brutal-btn-cyan px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 text-black"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" />
              <span>DOWNLOAD ZIP ({generatedResult.certificates.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedResult.certificates.map((cert) => (
              <div
                key={cert.id}
                className="brutal-card p-3 flex flex-col justify-between space-y-2.5 group hover:border-yellow-400 transition-all"
              >
                <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-[16/9] border-2 border-black dark:border-slate-700 flex items-center justify-center">
                  {cert.dataUrl ? (
                    <img
                      src={cert.dataUrl}
                      alt={cert.recipientName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400 space-y-1">
                      <FileCheck className="w-8 h-8 text-yellow-300" />
                      <span className="text-[10px] font-bold text-white uppercase">{cert.recipientName}</span>
                      <span className="text-[9px] text-slate-400">Certificate Ready in ZIP</span>
                    </div>
                  )}

                  {cert.dataUrl && (
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="p-1.5 rounded bg-white text-black border-2 border-black font-bold"
                        title="Preview large"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{cert.recipientName}</p>
                  <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-bold truncate">{cert.filename}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t-2 border-black dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => handleDownloadSingle(cert)}
                    className="flex items-center gap-1 text-slate-900 dark:text-yellow-300 hover:underline"
                  >
                    <Download className="w-3 h-3 stroke-[2.5]" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenVerification(
                        cert.id,
                        cert.recipientName
                      )
                    }
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Large Preview Modal */}
      {previewCert && previewCert.dataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="brutal-card max-w-4xl w-full p-6 space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white uppercase">{previewCert.filename}</span>
              <button
                onClick={() => setPreviewCert(null)}
                className="px-3 py-1 rounded bg-yellow-300 text-black border-2 border-black text-xs font-black"
              >
                CLOSE
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-slate-950 border-2 border-black aspect-[16/9]">
              <img
                src={previewCert.dataUrl}
                alt={previewCert.recipientName}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Recipient: {previewCert.recipientName}</span>
              <button
                onClick={() => handleDownloadSingle(previewCert)}
                className="brutal-btn-yellow px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 text-black"
              >
                <Download className="w-3.5 h-3.5 stroke-[3]" />
                <span>DOWNLOAD FILE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between p-4 brutal-card bg-yellow-100 dark:bg-slate-900">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold border-2 border-black dark:border-slate-700"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO MAP FIELDS</span>
        </button>
      </div>

    </div>
  );
};
