import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Trash2,
  Table,
  Search,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { TemplateFile, SpreadsheetData } from '../types';
import { renderPdfPageToDataUrl } from '../utils/pdfUtils';

interface UploadStepProps {
  template: TemplateFile | null;
  setTemplate: (t: TemplateFile | null) => void;
  spreadsheet: SpreadsheetData | null;
  setSpreadsheet: (s: SpreadsheetData | null) => void;
  onProceed: () => void;
  onLoadSample: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  template,
  setTemplate,
  spreadsheet,
  setSpreadsheet,
  onProceed,
  onLoadSample,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Template File Selection (PNG/JPG/PDF)
  const handleTemplateFile = async (file: File) => {
    setErrorMsg(null);
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
        setErrorMsg(err.message || 'Failed to process PDF template');
      }
    } else if (file.type.startsWith('image/')) {
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
      setErrorMsg('Unsupported template file type. Please upload a PNG, JPG, or PDF file.');
    }
  };

  // Handle Spreadsheet File Selection (CSV / XLSX)
  const handleSpreadsheetFile = (file: File) => {
    setErrorMsg(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setErrorMsg('The uploaded CSV file is empty.');
            return;
          }

          const headers = results.meta.fields || Object.keys(results.data[0] as object);
          validateAndSetSpreadsheet(file.name, headers, results.data as any[]);
        },
        error: (err) => {
          setErrorMsg(`Failed to parse CSV: ${err.message}`);
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!jsonData || jsonData.length === 0) {
            setErrorMsg('The Excel sheet contains no rows.');
            return;
          }

          const headers = Object.keys(jsonData[0] as object);
          validateAndSetSpreadsheet(file.name, headers, jsonData as any[]);
        } catch (err: any) {
          setErrorMsg(`Failed to parse Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg('Unsupported spreadsheet format. Please upload a CSV or XLSX file.');
    }
  };

  // Auto-detect 'name' column or let user select
  const validateAndSetSpreadsheet = (
    fileName: string,
    headers: string[],
    rows: Record<string, any>[]
  ) => {
    const nameHeader =
      headers.find((h) =>
        ['name', 'full_name', 'fullname', 'student_name', 'recipient', 'person'].includes(
          h.toLowerCase().trim()
        )
      ) || headers[0];

    if (!nameHeader) {
      setErrorMsg('Could not detect columns in the spreadsheet.');
      return;
    }

    setSpreadsheet({
      fileName,
      headers,
      rows,
      nameHeader,
    });
  };

  // Filtered rows for data table preview
  const filteredRows = spreadsheet
    ? spreadsheet.rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-slate-900 dark:text-slate-100">
      
      {/* Brutalist Title Banner */}
      <div className="brutal-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-yellow-300 dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white">
        <div>
          <h1 className="text-3xl font-black font-mono tracking-tight uppercase text-slate-900 dark:text-white">
            BULK CERTIFICATE GENERATOR
          </h1>
          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 mt-1">
            Upload design template & spreadsheet data ➔ Map fields visually ➔ Export bulk ZIP.
          </p>
        </div>

        <button
          onClick={onLoadSample}
          className="brutal-btn-cyan px-4 py-2 text-xs font-mono flex items-center gap-1.5 shrink-0 text-black"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>TRY DEMO SAMPLE</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400 border-2 border-black text-black font-mono font-bold text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dual Upload Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Certificate Template Dropzone */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-yellow-300 border-2 border-black font-black text-black">
                <FileImage className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black font-mono uppercase text-slate-900 dark:text-white">
                  1. CERTIFICATE TEMPLATE
                </h3>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">PNG, JPG, or PDF file</p>
              </div>
            </div>

            {template && (
              <button
                onClick={() => setTemplate(null)}
                className="p-1.5 text-slate-900 dark:text-white hover:text-red-500 rounded-lg border-2 border-black dark:border-slate-700"
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
              className="brutal-dashed p-8 flex flex-col items-center justify-center cursor-pointer text-center"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleTemplateFile(e.target.files[0]);
                }}
              />
              <Upload className="w-8 h-8 text-slate-900 dark:text-white mb-2 stroke-[2.5]" />
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                CLICK TO BROWSE OR DRAG & DROP
              </p>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold mt-1">Recommended size 1920x1080 or A4</p>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-black dark:border-slate-700 bg-slate-950 h-36">
                <img src={template.dataUrl} alt="Template preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{template.name} ({template.width}x{template.height}px)</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Recipient Spreadsheet Dropzone */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-300 border-2 border-black font-black text-black">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black font-mono uppercase text-slate-900 dark:text-white">
                  2. RECIPIENT SPREADSHEET
                </h3>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">CSV or Excel (.xlsx) file</p>
              </div>
            </div>

            {spreadsheet && (
              <button
                onClick={() => setSpreadsheet(null)}
                className="p-1.5 text-slate-900 dark:text-white hover:text-red-500 rounded-lg border-2 border-black dark:border-slate-700"
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
              className="brutal-dashed p-8 flex flex-col items-center justify-center cursor-pointer text-center"
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleSpreadsheetFile(e.target.files[0]);
                }}
              />
              <Upload className="w-8 h-8 text-slate-900 dark:text-white mb-2 stroke-[2.5]" />
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                CLICK TO BROWSE OR DRAG & DROP
              </p>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold mt-1">Must contain recipient name column</p>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-cyan-100 dark:bg-slate-800 border-2 border-black dark:border-slate-700 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{spreadsheet.fileName}</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-300 border-2 border-black text-black font-bold text-[10px]">
                    {spreadsheet.rows.length} ROWS
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Primary Name Column:</span>
                  <select
                    value={spreadsheet.nameHeader}
                    onChange={(e) =>
                      setSpreadsheet({
                        ...spreadsheet,
                        nameHeader: e.target.value,
                      })
                    }
                    className="px-2 py-1 rounded bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
                  >
                    {spreadsheet.headers.map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>SPREADSHEET PARSED SUCCESSFULLY</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Spreadsheet Table Preview if Loaded */}
      {spreadsheet && (
        <div className="brutal-card p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-slate-900 dark:text-white" />
              <h3 className="text-sm font-black font-mono uppercase text-slate-900 dark:text-white">
                RECIPIENT RECORDS ({spreadsheet.rows.length})
              </h3>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border-2 border-black dark:border-slate-700 max-h-48">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-yellow-300 text-black font-black uppercase sticky top-0 border-b-2 border-black">
                <tr>
                  <th className="p-2.5 font-black">#</th>
                  {spreadsheet.headers.map((h) => (
                    <th key={h} className="p-2.5 font-black">
                      {h} {h === spreadsheet.nameHeader && '(NAME)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-slate-700 bg-white dark:bg-slate-900">
                {filteredRows.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50 dark:hover:bg-slate-800">
                    <td className="p-2.5 font-bold text-slate-600 dark:text-slate-400">{idx + 1}</td>
                    {spreadsheet.headers.map((h) => (
                      <td
                        key={h}
                        className={`p-2.5 ${
                          h === spreadsheet.nameHeader ? 'font-black text-indigo-600 dark:text-yellow-300' : 'text-slate-900 dark:text-slate-100'
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

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between p-5 brutal-card bg-yellow-100 dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white">
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
          {!template || !spreadsheet
            ? '★ Upload template and spreadsheet above to unlock visual mapping.'
            : '★ Files ready! Click continue to place text fields on canvas.'}
        </span>

        <button
          disabled={!template || !spreadsheet}
          onClick={onProceed}
          className={`flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-black uppercase transition-all ${
            template && spreadsheet
              ? 'brutal-btn-yellow text-black'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 border-2 border-black cursor-not-allowed opacity-50'
          }`}
        >
          <span>CONTINUE TO MAP FIELDS</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

    </div>
  );
};
