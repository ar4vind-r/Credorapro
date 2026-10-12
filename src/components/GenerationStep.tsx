import React, { useState, useRef } from 'react';
import {
  Download,
  Zap,
  RefreshCcw,
  Eye,
  ShieldCheck,
  ChevronLeft,
  Settings,
  FileCheck,
  Check,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import type {
  TemplateFile,
  SpreadsheetData,
  FieldMapping,
  OutputOptions,
  GeneratedCert,
  FailedRowError,
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
  const [failedRows, setFailedRows] = useState<FailedRowError[]>([]);
  const [wasCancelled, setWasCancelled] = useState(false);

  const [previewCert, setPreviewCert] = useState<GeneratedCert | null>(null);
  const cancelRequestedRef = useRef(false);

  // Trigger batch generation
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedResult(null);
    setFailedRows([]);
    setWasCancelled(false);
    cancelRequestedRef.current = false;

    try {
      const result = await batchGenerateCertificates(
        template,
        spreadsheet,
        mappings,
        options,
        (pct, item) => {
          setProgress(pct);
          setCurrentItem(item);
        },
        () => cancelRequestedRef.current
      );

      if (result.cancelled) {
        setWasCancelled(true);
      }

      setGeneratedResult({
        zipBlob: result.zipBlob,
        certificates: result.certificates,
      });

      if (result.failedRows && result.failedRows.length > 0) {
        setFailedRows(result.failedRows);
      }

      // Trigger celebration confetti if completed without full failure
      if (!result.cancelled && result.certificates.length > 0) {
        try {
          const { default: confetti } = await import('canvas-confetti');
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#facc15', '#22d3ee', '#10b981', '#000000'],
          });
        } catch {
          // Ignore confetti import error
        }
      }
    } catch (err: any) {
      alert(`Generation encountered an error: ${err.message}`);
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. Header with Clear Typographic Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900/10 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
            Step 3 of 3
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Export Batch Certificates
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ready to render <span className="font-bold text-slate-900 dark:text-white">{spreadsheet.rows.length}</span> recipient certificates in a single downloadable ZIP bundle.
          </p>
        </div>

        {generatedResult && (
          <button
            type="button"
            onClick={handleDownloadZip}
            className="min-h-[44px] brutal-btn-yellow px-6 py-3 text-xs font-mono font-black uppercase flex items-center justify-center gap-2 shrink-0 text-black"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Download ZIP ({generatedResult.certificates.length} Files)</span>
          </button>
        )}
      </div>

      {/* 2. Output Settings Panel (Shown when not yet generated) */}
      {!generatedResult && (
        <div className="brutal-card p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-900/10 dark:border-slate-800">
            <Settings className="w-5 h-5 text-slate-700 dark:text-yellow-400 stroke-[2]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Export Output Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            
            {/* Format Selector */}
            <div className="space-y-2">
              <label htmlFor="format-select" className="font-bold text-slate-900 dark:text-slate-200 block text-xs font-mono uppercase">
                Output Format:
              </label>
              <div id="format-select" role="group" aria-label="Output format selection" className="grid grid-cols-3 gap-2">
                {(['pdf', 'png', 'jpg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOptions({ ...options, format: fmt })}
                    className={`min-h-[44px] rounded-lg font-mono text-xs font-bold uppercase border-2 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                      options.format === fmt
                        ? 'bg-yellow-400 text-slate-950 border-slate-950 font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-900/40 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Naming Pattern */}
            <div className="space-y-2">
              <label htmlFor="filename-pattern-input" className="font-bold text-slate-900 dark:text-slate-200 block text-xs font-mono uppercase">
                Filename Pattern:
              </label>
              <input
                id="filename-pattern-input"
                type="text"
                value={options.filenamePattern}
                onChange={(e) => setOptions({ ...options, filenamePattern: e.target.value })}
                className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="{{name}}_Certificate"
              />
              <p className="text-[11px] text-slate-500 font-mono">Use &#123;&#123;name&#125;&#125; or column names</p>
            </div>

            {/* Quality Resolution */}
            <div className="space-y-2">
              <label htmlFor="quality-select" className="font-bold text-slate-900 dark:text-slate-200 block text-xs font-mono uppercase">
                Export Quality:
              </label>
              <select
                id="quality-select"
                value={options.imageQuality}
                onChange={(e) => setOptions({ ...options, imageQuality: Number(e.target.value) })}
                className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value={1.0} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  Maximum Resolution (100%)
                </option>
                <option value={0.92} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  Balanced (92%)
                </option>
                <option value={0.80} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  Compact Storage (80%)
                </option>
              </select>
            </div>

          </div>

          {/* Primary Generation Action */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleStartGeneration}
              className="w-full min-h-[52px] brutal-btn-yellow py-3.5 text-sm font-mono font-black uppercase flex items-center justify-center gap-2 text-black"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Generate {spreadsheet.rows.length} Certificates</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Generating Progress Card with Active Live Region & Cancellation */}
      {isGenerating && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="brutal-card p-6 text-center space-y-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700"
        >
          <div className="inline-flex p-3 rounded-full bg-yellow-400 text-slate-950 border-2 border-slate-950">
            <RefreshCcw className="w-6 h-6 animate-spin stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-mono uppercase">
              Rendering Certificates ({progress}%)
            </h2>
            <p className="text-xs font-mono font-bold text-slate-600 dark:text-yellow-400">
              Processing: {currentItem}
            </p>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-slate-900 dark:border-slate-700 max-w-md mx-auto">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-yellow-400 rounded-full transition-all duration-200"
            />
          </div>

          {/* Cancel Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                cancelRequestedRef.current = true;
              }}
              className="min-h-[44px] px-5 py-2 rounded-lg border-2 border-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Generation</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Section on Batch Complete */}
      {generatedResult && (
        <div className="space-y-6">
          
          {/* Cancellation Notice if stopped early */}
          {wasCancelled && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-600 text-amber-950 dark:text-amber-200 text-xs font-mono flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Generation was cancelled by user. Completed {generatedResult.certificates.length} certificates have been packaged in the ZIP archive.
              </span>
            </div>
          )}

          {/* Skipped Rows Reporting */}
          {failedRows.length > 0 && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-950 dark:text-rose-200 text-xs font-mono space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{failedRows.length} Row(s) Skipped Due to Render Errors:</span>
              </div>
              <p className="text-[11px] font-sans text-slate-700 dark:text-slate-300">
                The remaining certificates were successfully bundled. Please review the failed entries:
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {failedRows.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white dark:bg-slate-900 rounded border border-rose-600/30 flex justify-between gap-2"
                  >
                    <span className="font-bold">Row {f.rowIndex} ({f.recipientName}):</span>
                    <span className="text-rose-600 dark:text-rose-400">{f.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Callout Bar */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-600 text-white shrink-0">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200 block font-mono">
                  Batch Completed Successfully
                </span>
                <span className="text-xs text-emerald-800 dark:text-emerald-400">
                  {generatedResult.certificates.length} certificates generated and bundled into ZIP.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadZip}
                className="w-full sm:w-auto min-h-[44px] brutal-btn-yellow px-5 py-2.5 text-xs font-mono font-black uppercase text-black flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Full ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                className="min-h-[44px] px-3.5 py-2.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold"
                title="Change settings and re-render"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Thumbnail Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedResult.certificates.map((cert) => (
              <div
                key={cert.id}
                className="brutal-card p-3.5 flex flex-col justify-between space-y-3 bg-white dark:bg-slate-900"
              >
                <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-[16/9] border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center">
                  {cert.dataUrl ? (
                    <img
                      src={cert.dataUrl}
                      alt={`Certificate preview for ${cert.recipientName}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400 space-y-1">
                      <FileCheck className="w-8 h-8 text-yellow-400" />
                      <span className="text-xs font-bold text-white uppercase">{cert.recipientName}</span>
                      <span className="text-[10px] text-slate-400">Certificate in ZIP</span>
                    </div>
                  )}

                  {cert.dataUrl && (
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPreviewCert(cert)}
                        className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-white text-slate-950 font-bold border-2 border-slate-950 flex items-center justify-center"
                        title="Preview larger"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{cert.recipientName}</p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">{cert.filename}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900/10 dark:border-slate-800 text-xs font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(cert)}
                    className="min-h-[36px] px-2 flex items-center gap-1 text-slate-900 dark:text-yellow-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenVerification(cert.id, cert.recipientName)}
                    className="min-h-[36px] px-2 flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. Modal for Large Certificate Preview */}
      {previewCert && previewCert.dataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${previewCert.filename}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 font-mono"
        >
          <div className="brutal-card max-w-4xl w-full p-6 space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-4 border-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm truncate uppercase">{previewCert.filename}</span>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="min-h-[36px] px-3 rounded-lg bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-slate-950 border-2 border-slate-900 aspect-[16/9]">
              <img
                src={previewCert.dataUrl}
                alt={`Expanded certificate view for ${previewCert.recipientName}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-bold">
              <span>Recipient: {previewCert.recipientName}</span>
              <button
                type="button"
                onClick={() => handleDownloadSingle(previewCert)}
                className="min-h-[44px] brutal-btn-yellow px-5 py-2 text-xs font-black uppercase flex items-center gap-1.5 text-black"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Footer Navigation Bar */}
      <div className="flex items-center justify-between p-4 brutal-card bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Map Fields</span>
        </button>

        {generatedResult && (
          <button
            type="button"
            onClick={handleDownloadZip}
            className="min-h-[44px] brutal-btn-yellow px-6 py-2.5 text-xs font-mono font-black uppercase text-black flex items-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download All ({generatedResult.certificates.length} Files)</span>
          </button>
        )}
      </div>

    </div>
  );
};
