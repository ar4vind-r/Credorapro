import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Trash2,
  Search,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react';
import Papa from 'papaparse';
import type { TemplateFile, SpreadsheetData } from '../types';
import { renderPdfPageToDataUrl } from '../utils/pdfUtils';
import { validateSpreadsheet } from '../utils/spreadsheet';

interface UploadStepProps {
  template: TemplateFile | null;
  setTemplate: (t: TemplateFile | null) => void;
  spreadsheet: SpreadsheetData | null;
  setSpreadsheet: (s: SpreadsheetData | null) => void;
  onProceed: () => void;
  onLoadSample: () => void;
  onOpenVerification?: (certId?: string) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  template,
  setTemplate,
  spreadsheet,
  setSpreadsheet,
  onProceed,
  onLoadSample,
  onOpenVerification,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualCertId, setManualCertId] = useState('');

  // Handle Template File Selection (PNG/JPG/PDF)
  const handleTemplateFile = async (file: File) => {
    setErrorMsg(null);

    // Empty file check
    if (file.size === 0) {
      setErrorMsg(`Template file '${file.name}' is empty (0 bytes). Please upload a valid image or PDF.`);
      return;
    }

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfResult = await renderPdfPageToDataUrl(buffer, 1, 2.0);

        setTemplate({
          name: file.name,
          type: 'pdf',
          dataUrl: pdfResult.dataUrl,
          width: pdfResult.width,
          height: pdfResult.height,
          pdfBytes: buffer,
          numPages: pdfResult.numPages,
          selectedPage: 1,
        });
      } catch (err: any) {
        setErrorMsg(
          err.message || 'Could not rasterize PDF template. Ensure the PDF is not password-protected and re-upload.'
        );
      }
    } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setTemplate({
            name: file.name,
            type: 'image',
            dataUrl,
            width: img.naturalWidth || 1920,
            height: img.naturalHeight || 1080,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg(`Unsupported file format '${file.name}'. Please upload a PNG, JPG, or PDF file.`);
    }
  };

  // Handle Spreadsheet File Selection (CSV / XLSX)
  const handleSpreadsheetFile = (file: File) => {
    setErrorMsg(null);

    // Empty file check
    if (file.size === 0) {
      setErrorMsg(`Spreadsheet file '${file.name}' is empty (0 bytes). Please upload a valid CSV or Excel file.`);
      return;
    }

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        encoding: 'utf-8',
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setErrorMsg('The uploaded CSV file is empty. Please add a header row and attendee records.');
            return;
          }

          const rawHeaders = results.meta.fields || Object.keys(results.data[0] as object);
          const headers = rawHeaders.map((h) => h.trim()).filter(Boolean);

          if (headers.length === 0) {
            setErrorMsg('The CSV file has no valid column headers in row 1. Please add headers (e.g. Name, Course, Date).');
            return;
          }

          validateAndSetSpreadsheet(file.name, headers, results.data as Record<string, any>[]);
        },
        error: (err) => {
          setErrorMsg(`Could not read CSV file: ${err.message}. Please check file encoding (UTF-8 recommended) and re-upload.`);
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Dynamic import of xlsx library to optimize initial bundle size
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];

          if (!firstSheetName) {
            setErrorMsg('The Excel workbook contains no sheets.');
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];

          if (!jsonData || jsonData.length === 0) {
            setErrorMsg(`Sheet '${firstSheetName}' in ${file.name} is empty. Add a header row and attendee data.`);
            return;
          }

          const headers = Object.keys(jsonData[0] as object).map((h) => h.trim()).filter(Boolean);
          validateAndSetSpreadsheet(file.name, headers, jsonData);
        } catch (err: any) {
          setErrorMsg(`Could not parse Excel spreadsheet: ${err.message}. Export as CSV and re-upload.`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg(`Unsupported spreadsheet format '${file.name}'. Please upload a CSV (.csv) or Excel (.xlsx) file.`);
    }
  };

  // Granular validation with row-specific error reporting
  const validateAndSetSpreadsheet = (
    fileName: string,
    headers: string[],
    rawRows: Record<string, any>[]
  ) => {
    const result = validateSpreadsheet(fileName, headers, rawRows);
    if (!result.success) {
      setErrorMsg(result.error);
      return;
    }

    setSpreadsheet(result.data);
  };

  // Download Sample CSV format for immediate testing/reference
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Name,Course,Date,Role\nAlex Rivera,Advanced Python Development,October 12 2026,Participant\nJordan Lee,Modern Web Architecture,October 12 2026,Honor Graduate\nTaylor Swift,Creative Music Production,October 12 2026,Distinction Award';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credora_sample_attendees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered rows for data table preview
  const filteredRows = spreadsheet
    ? spreadsheet.rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  const isReadyToProceed = !!template && !!spreadsheet && spreadsheet.rows.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* 1. Page Header with Strong Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900/10 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Upload Template & Recipient List
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Supply your graphic certificate background and recipient spreadsheet. Everything is processed 100% locally in your browser with zero data sent to external servers.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadSample}
          className="min-h-[44px] px-4 py-2.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Try Demo Data</span>
        </button>
      </div>

      {/* 2. Specific Actionable Error Alert */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-600 dark:border-red-500 text-red-950 dark:text-red-200 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Spreadsheet Issue Detected:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* 3. Expected Spreadsheet Format Guide */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-900/20 dark:border-slate-700 text-xs font-mono space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">Expected Spreadsheet Columns:</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 text-xs text-slate-900 dark:text-yellow-400 underline font-bold hover:text-yellow-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-400 font-sans text-xs">
          Column 1 must contain attendee names (e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">Name</code> or <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">Recipient</code>). Additional columns like <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">Course</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">Date</code>, or <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">Grade</code> can be mapped to custom canvas text in Step 2.
        </p>
      </div>

      {/* 4. Dual Intake Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Zone A: Certificate Template */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Step 1A
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Certificate Visual Template
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, or PDF (1920x1080 or A4)</span>
            </div>

            {template && (
              <button
                type="button"
                onClick={() => setTemplate(null)}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-lg border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center transition-colors"
                title="Remove template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!template ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleTemplateFile(e.dataTransfer.files[0]);
              }}
              className="brutal-dashed min-h-[160px] p-6 flex flex-col items-center justify-center cursor-pointer text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-within:ring-2 focus-within:ring-slate-900"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleTemplateFile(e.target.files[0]);
                }}
              />
              <FileImage className="w-8 h-8 text-slate-700 dark:text-slate-300 mb-2 stroke-[2]" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Click to browse or drop template
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PNG, JPG, and single-page PDF
              </span>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-slate-900 dark:border-slate-700 bg-slate-950 h-36">
                <img src={template.dataUrl} alt="Template preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{template.name} ({template.width}x{template.height}px)</span>
              </div>
            </div>
          )}
        </div>

        {/* Zone B: Recipient Spreadsheet */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Step 1B
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Attendee Spreadsheet
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">CSV or Excel (.xlsx) file</span>
            </div>

            {spreadsheet && (
              <button
                type="button"
                onClick={() => setSpreadsheet(null)}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-lg border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center transition-colors"
                title="Remove spreadsheet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!spreadsheet ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleSpreadsheetFile(e.dataTransfer.files[0]);
              }}
              className="brutal-dashed min-h-[160px] p-6 flex flex-col items-center justify-center cursor-pointer text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-within:ring-2 focus-within:ring-slate-900"
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleSpreadsheetFile(e.target.files[0]);
                }}
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-700 dark:text-slate-300 mb-2 stroke-[2]" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Click to browse or drop spreadsheet
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                CSV or Excel (.xlsx) with recipient names
              </span>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{spreadsheet.fileName}</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[11px]">
                    {spreadsheet.rows.length} Attendees
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label htmlFor="name-col-select" className="text-slate-600 dark:text-slate-400 font-bold text-[11px] shrink-0">
                    Recipient Name Column:
                  </label>
                  <select
                    id="name-col-select"
                    value={spreadsheet.nameHeader}
                    onChange={(e) =>
                      setSpreadsheet({
                        ...spreadsheet,
                        nameHeader: e.target.value,
                      })
                    }
                    className="min-h-[40px] px-2 py-1 rounded bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
                  >
                    {spreadsheet.headers.map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Spreadsheet verified: {spreadsheet.rows.length} valid attendee rows</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 5. Spreadsheet Tabular Preview */}
      {spreadsheet && (
        <div className="brutal-card p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                Parsed Attendee Rows ({spreadsheet.rows.length})
              </h3>
              <p className="text-xs text-slate-500">Previewing first 20 records. Confirm columns are mapped accurately.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-[40px] w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border-2 border-slate-900 dark:border-slate-700 max-h-52">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-yellow-400 text-slate-950 font-black uppercase sticky top-0 border-b-2 border-slate-900">
                <tr>
                  <th className="p-2.5 font-black">#</th>
                  {spreadsheet.headers.map((h) => (
                    <th key={h} className="p-2.5 font-black whitespace-nowrap">
                      {h} {h === spreadsheet.nameHeader && '(NAME)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredRows.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                    {spreadsheet.headers.map((h) => (
                      <td
                        key={h}
                        className={`p-2.5 ${
                          h === spreadsheet.nameHeader
                            ? 'font-black text-slate-900 dark:text-yellow-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {String(row[h] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Dominant Primary Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 brutal-card bg-white dark:bg-slate-900">
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
            {!template && !spreadsheet
              ? 'Upload both certificate template and attendee spreadsheet above to proceed.'
              : !template
              ? 'Template missing: upload an image or PDF template to continue.'
              : !spreadsheet
              ? 'Spreadsheet missing: upload attendee data to continue.'
              : `Ready to map ${spreadsheet.rows.length} attendee certificates.`}
          </span>
        </div>

        <button
          type="button"
          disabled={!isReadyToProceed}
          onClick={onProceed}
          className="w-full sm:w-auto brutal-btn-yellow px-8 py-3.5 text-xs font-mono font-black uppercase flex items-center justify-center gap-2"
        >
          <span>
            {isReadyToProceed
              ? `Continue to Map Fields (${spreadsheet.rows.length} Attendees)`
              : 'Upload Files to Continue'}
          </span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* 7. Dedicated Verification Section for Physical / Damaged Certificates */}
      <div className="brutal-card p-5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 space-y-3 font-mono">
        <div className="flex items-center gap-2 border-b-2 border-slate-900/10 dark:border-slate-800 pb-2">
          <div className="p-1 rounded bg-yellow-400 text-slate-950 border-2 border-slate-950">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white">
              Verify Printed Certificate by ID
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Checking a physical, printed, or damaged certificate? Enter the certificate ID (e.g. CRD-2026-X8K9M2) to query the official registry.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCertId.trim() && onOpenVerification) {
              onOpenVerification(manualCertId.trim().toUpperCase());
            }
          }}
          className="flex flex-col sm:flex-row gap-2 max-w-xl"
        >
          <label htmlFor="home-cert-search-input" className="sr-only">
            Certificate Number to Verify
          </label>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 stroke-[2.5]" aria-hidden="true" />
            <input
              id="home-cert-search-input"
              type="text"
              value={manualCertId}
              onChange={(e) => setManualCertId(e.target.value.toUpperCase())}
              placeholder="e.g. CRD-2026-X8K9M2"
              aria-label="Certificate number to verify"
              className="min-h-[44px] w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCertId.trim()}
            className="min-h-[44px] px-6 py-2.5 brutal-btn-yellow text-xs font-black uppercase text-black disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Verify Now
          </button>
        </form>
      </div>

    </div>
  );
};
