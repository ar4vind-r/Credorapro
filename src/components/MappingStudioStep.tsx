import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  Upload,
  Plus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Eye,
  Sliders,
  Move,
  Type,
  FileText,
  Keyboard,
  Crosshair,
} from 'lucide-react';
import type {
  TemplateFile,
  SpreadsheetData,
  FieldMapping,
  FieldStyle,
} from '../types';
import { AVAILABLE_FONTS } from '../types';
import { getRowValue } from '../utils/generator';

interface MappingStudioStepProps {
  template: TemplateFile;
  spreadsheet: SpreadsheetData;
  mappings: FieldMapping[];
  setMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  onProceed: () => void;
  onBack: () => void;
}

const PRESET_COLORS = [
  { label: 'Champagne Gold', value: '#fef08a' },
  { label: 'Royal Amber', value: '#f59e0b' },
  { label: 'Warm Bronze', value: '#b45309' },
  { label: 'Pure White', value: '#ffffff' },
  { label: 'Indigo Blue', value: '#4f46e5' },
  { label: 'Deep Slate', value: '#0f172a' },
  { label: 'Emerald Green', value: '#10b981' },
  { label: 'Deep Crimson', value: '#ef4444' },
];

const PRESET_PARAGRAPHS = [
  {
    title: "⚡ Solasta'26 Innovation Auction",
    text: "has actively participated in the INNOVATION AUCTION competition as part of SOLASTA’26 by STACS, NSSCE on 7th MARCH 2026",
  },
  {
    title: '🎓 Workshop Completion',
    text: 'has successfully completed the intensive hands-on workshop on Advanced Artificial Intelligence and Web Development held on 15th AUGUST 2026',
  },
  {
    title: '🥇 1st Place Excellence',
    text: 'is hereby awarded 1st Place for outstanding innovation, technical skill, and leadership in the National Technology Hackathon Championship',
  },
  {
    title: '📜 Certificate of Honor',
    text: 'is awarded this Certificate of Recognition in honor of dedicated service, outstanding contribution, and commitment to excellence',
  },
];

export const MappingStudioStep: React.FC<MappingStudioStepProps> = ({
  template,
  spreadsheet,
  mappings,
  setMappings,
  onProceed,
  onBack,
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(
    mappings.length > 0 ? mappings[0].id : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewWidth, setPreviewWidth] = useState(1000);
  const [nudgeStep, setNudgeStep] = useState<number>(0.2); // 0.2% for micro, 1.0% for fast

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const selectedRow = spreadsheet.rows[selectedRowIndex] || spreadsheet.rows[0];
  const activeField = mappings.find((m) => m.id === activeFieldId) || null;

  // Track container width for 100% proportional font size parity
  useEffect(() => {
    const updateContainerWidth = () => {
      if (canvasContainerRef.current) {
        setPreviewWidth(canvasContainerRef.current.clientWidth || 1000);
      }
    };

    updateContainerWidth();
    const resizeObserver = new ResizeObserver(() => updateContainerWidth());
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Keyboard Arrow Keys Precise Nudging Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeFieldId) return;

      // Don't intercept arrow keys if user is typing in an input, textarea, or select
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      const currentField = mappings.find((m) => m.id === activeFieldId);
      if (!currentField) return;

      const step = e.shiftKey ? 1.0 : 0.2;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newY = Math.max(0, Math.round((currentField.style.y - step) * 10) / 10);
        setMappings((prev) =>
          prev.map((m) => (m.id === activeFieldId ? { ...m, style: { ...m.style, y: newY } } : m))
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newY = Math.min(95, Math.round((currentField.style.y + step) * 10) / 10);
        setMappings((prev) =>
          prev.map((m) => (m.id === activeFieldId ? { ...m, style: { ...m.style, y: newY } } : m))
        );
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newX = Math.max(0, Math.round((currentField.style.x - step) * 10) / 10);
        setMappings((prev) =>
          prev.map((m) => (m.id === activeFieldId ? { ...m, style: { ...m.style, x: newX } } : m))
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newX = Math.min(95, Math.round((currentField.style.x + step) * 10) / 10);
        setMappings((prev) =>
          prev.map((m) => (m.id === activeFieldId ? { ...m, style: { ...m.style, x: newX } } : m))
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFieldId, mappings]);

  // Auto initialize mappings if empty
  useEffect(() => {
    if (mappings.length === 0 && spreadsheet.headers.length > 0) {
      const initialMappings: FieldMapping[] = spreadsheet.headers.map((h, i) => ({
        id: `field_${h}_${Date.now()}`,
        type: 'column',
        columnName: h,
        label: h,
        style: {
          fontFamily: i === 0 ? 'Cinzel, serif' : 'Playfair Display, serif',
          fontSize: i === 0 ? 32 : 20,
          fontWeight: i === 0 ? '700' : 'normal',
          fontStyle: 'normal',
          color: i === 0 ? '#fef08a' : '#f59e0b',
          textAlign: 'center',
          textTransform: i === 0 ? 'uppercase' : 'none',
          letterSpacing: i === 0 ? 2 : 0,
          lineHeight: 1.2,
          x: 20,
          y: 35 + i * 12,
          width: 60,
          height: 8,
        },
      }));
      setMappings(initialMappings);
      if (initialMappings.length > 0) {
        setActiveFieldId(initialMappings[0].id);
      }
    }
  }, []);

  // Update style property of active field
  const updateActiveFieldStyle = (key: keyof FieldStyle, value: any) => {
    if (!activeFieldId) return;
    setMappings((prev) =>
      prev.map((m) => (m.id === activeFieldId ? { ...m, style: { ...m.style, [key]: value } } : m))
    );
  };

  // Nudge direction helper (for on-screen precision buttons)
  const nudgeField = (dir: 'up' | 'down' | 'left' | 'right', step: number = nudgeStep) => {
    if (!activeField) return;
    if (dir === 'up') {
      updateActiveFieldStyle('y', Math.max(0, Math.round((activeField.style.y - step) * 10) / 10));
    } else if (dir === 'down') {
      updateActiveFieldStyle('y', Math.min(95, Math.round((activeField.style.y + step) * 10) / 10));
    } else if (dir === 'left') {
      updateActiveFieldStyle('x', Math.max(0, Math.round((activeField.style.x - step) * 10) / 10));
    } else if (dir === 'right') {
      updateActiveFieldStyle('x', Math.min(95, Math.round((activeField.style.x + step) * 10) / 10));
    }
  };

  // Update custom text content of active field
  const updateActiveFieldCustomText = (text: string) => {
    if (!activeFieldId) return;
    setMappings((prev) =>
      prev.map((m) => (m.id === activeFieldId ? { ...m, customText: text } : m))
    );
  };

  // Add new field column mapping
  const addColumnField = (colName: string) => {
    const newField: FieldMapping = {
      id: `field_${colName}_${Date.now()}`,
      type: 'column',
      columnName: colName,
      label: colName,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'none',
        letterSpacing: 0,
        lineHeight: 1.2,
        x: 25,
        y: 50,
        width: 50,
        height: 6,
      },
    };
    setMappings((prev) => [...prev, newField]);
    setActiveFieldId(newField.id);
  };

  // Add Custom Static Text Field
  const addCustomTextField = (presetText?: string, label?: string) => {
    const defaultText =
      presetText ||
      'has actively participated in the INNOVATION AUCTION competition as part of SOLASTA’26 by STACS, NSSCE on 7th MARCH 2026';

    const newField: FieldMapping = {
      id: `field_custom_${Date.now()}`,
      type: 'custom',
      customText: defaultText,
      label: label || 'Custom Text Paragraph',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'none',
        letterSpacing: 0,
        lineHeight: 1.4,
        x: 15,
        y: 48,
        width: 70,
        height: 12,
      },
    };
    setMappings((prev) => [...prev, newField]);
    setActiveFieldId(newField.id);
  };

  // Add Verification QR Code
  const addQrCodeField = () => {
    const newField: FieldMapping = {
      id: `field_qr_${Date.now()}`,
      type: 'qr_code',
      columnName: spreadsheet.nameHeader,
      label: 'Verification QR Code',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'none',
        letterSpacing: 0,
        lineHeight: 1,
        x: 85,
        y: 80,
        width: 10,
        height: 14,
      },
    };
    setMappings((prev) => [...prev, newField]);
    setActiveFieldId(newField.id);
  };

  // Delete field
  const deleteField = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
    if (activeFieldId === id) {
      const remaining = mappings.filter((m) => m.id !== id);
      setActiveFieldId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, field: FieldMapping) => {
    e.stopPropagation();
    setActiveFieldId(field.id);
    setIsDragging(true);

    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const currentXpx = (field.style.x / 100) * rect.width;
      const currentYpx = (field.style.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - currentXpx,
        y: e.clientY - rect.top - currentYpx,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !activeFieldId || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();

    let newXpx = e.clientX - rect.left - dragOffset.x;
    let newYpx = e.clientY - rect.top - dragOffset.y;

    let pctX = Math.max(0, Math.min(90, (newXpx / rect.width) * 100));
    let pctY = Math.max(0, Math.min(90, (newYpx / rect.height) * 100));

    updateActiveFieldStyle('x', Math.round(pctX * 10) / 10);
    updateActiveFieldStyle('y', Math.round(pctY * 10) / 10);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent, field: FieldMapping) => {
    e.stopPropagation();
    if (!e.touches[0]) return;
    const touch = e.touches[0];
    setActiveFieldId(field.id);
    setIsDragging(true);

    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const currentXpx = (field.style.x / 100) * rect.width;
      const currentYpx = (field.style.y / 100) * rect.height;
      setDragOffset({
        x: touch.clientX - rect.left - currentXpx,
        y: touch.clientY - rect.top - currentYpx,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !activeFieldId || !canvasContainerRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = canvasContainerRef.current.getBoundingClientRect();

    let newXpx = touch.clientX - rect.left - dragOffset.x;
    let newYpx = touch.clientY - rect.top - dragOffset.y;

    let pctX = Math.max(0, Math.min(90, (newXpx / rect.width) * 100));
    let pctY = Math.max(0, Math.min(90, (newYpx / rect.height) * 100));

    updateActiveFieldStyle('x', Math.round(pctX * 10) / 10);
    updateActiveFieldStyle('y', Math.round(pctY * 10) / 10);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Export Mappings to JSON
  const handleExportTemplateConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mappings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'credora_mapping_config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Mappings from JSON
  const handleImportTemplateConfig = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setMappings(imported);
          if (imported.length > 0) setActiveFieldId(imported[0].id);
        }
      } catch (err) {
        alert('Invalid JSON mapping file format');
      }
    };
    reader.readAsText(file);
  };

  const previewScale = previewWidth / 1000;
  const aspectStyle = template.width && template.height ? { aspectRatio: `${template.width} / ${template.height}` } : {};

  return (
    <div
      className="max-w-7xl mx-auto space-y-5 pb-16 text-slate-900 dark:text-slate-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Top Bar Controls */}
      <div className="brutal-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 bg-yellow-100 dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white">
        
        {/* Row Selector Switcher */}
        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-white uppercase">
            <Eye className="w-4 h-4 text-slate-900 dark:text-yellow-300" />
            <span>PREVIEW ROW:</span>
          </span>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border-2 border-black dark:border-slate-700">
            <button
              disabled={selectedRowIndex === 0}
              onClick={() => setSelectedRowIndex((prev) => Math.max(0, prev - 1))}
              className="p-1 text-slate-900 dark:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <select
              value={selectedRowIndex}
              onChange={(e) => setSelectedRowIndex(Number(e.target.value))}
              className="bg-transparent font-black text-xs px-2 text-slate-900 dark:text-white focus:outline-none"
            >
              {spreadsheet.rows.map((r, i) => {
                const recName = getRowValue(r, spreadsheet.nameHeader) || getRowValue(r, 'name') || `Recipient ${i + 1}`;
                return (
                  <option key={i} value={i} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    ROW {i + 1}: {recName}
                  </option>
                );
              })}
            </select>

            <button
              disabled={selectedRowIndex >= spreadsheet.rows.length - 1}
              onClick={() => setSelectedRowIndex((prev) => Math.min(spreadsheet.rows.length - 1, prev + 1))}
              className="p-1 text-slate-900 dark:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Layout Save/Load Buttons */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <button
            onClick={handleExportTemplateConfig}
            className="brutal-btn-yellow px-3 py-1.5 flex items-center gap-1.5 text-black"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SAVE MAPPING</span>
          </button>

          <label className="brutal-btn-cyan px-3 py-1.5 flex items-center gap-1.5 cursor-pointer text-black">
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>LOAD MAPPING</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImportTemplateConfig(e.target.files[0]);
              }}
            />
          </label>
        </div>

      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Interactive Canvas Container (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="brutal-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Move className="w-4 h-4" />
                <span>DRAG OR USE ARROW KEYS (↑ ↓ ← →) TO POSITION</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-100 dark:bg-slate-800 text-slate-800 dark:text-cyan-300 border border-black dark:border-slate-700 text-[10px]">
                  <Keyboard className="w-3 h-3" />
                  <span>Shift+Arrows for 1%</span>
                </span>
                <span className="bg-yellow-300 text-black border-2 border-black px-2 py-0.5 rounded font-black text-[11px] uppercase">
                  {template.name}
                </span>
              </div>
            </div>

            <div
              ref={canvasContainerRef}
              style={aspectStyle}
              className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border-2 border-black shadow-[4px_4px_0px_0px_#000000] select-none touch-none"
            >
              <img
                src={template.dataUrl}
                alt="Certificate template"
                className="w-full h-full object-fill pointer-events-none"
              />

              {mappings.map((m) => {
                const isActive = m.id === activeFieldId;
                let displayVal = '';

                if (m.type === 'column' && m.columnName) {
                  displayVal = getRowValue(selectedRow, m.columnName) || `{{${m.columnName}}}`;
                } else if (m.type === 'custom') {
                  displayVal = m.customText || 'Custom Text';
                }

                if (m.style.textTransform === 'uppercase') displayVal = displayVal.toUpperCase();
                if (m.style.textTransform === 'capitalize') {
                  displayVal = displayVal.replace(/\b\w/g, (l) => l.toUpperCase());
                }

                const scaledFontSize = Math.max(8, m.style.fontSize * previewScale);

                return (
                  <div
                    key={m.id}
                    onMouseDown={(e) => handleMouseDown(e, m)}
                    onTouchStart={(e) => handleTouchStart(e, m)}
                    style={{
                      left: `${m.style.x}%`,
                      top: `${m.style.y}%`,
                      width: `${m.style.width}%`,
                      height: `${m.style.height}%`,
                      touchAction: 'none',
                    }}
                    className={`absolute cursor-move flex items-center transition-shadow group touch-none ${
                      m.style.textAlign === 'center'
                        ? 'justify-center text-center'
                        : m.style.textAlign === 'right'
                        ? 'justify-end text-right'
                        : 'justify-start text-left'
                    } ${
                      isActive
                        ? 'ring-4 ring-yellow-400 bg-yellow-300/20 shadow-md border-2 border-black'
                        : 'hover:ring-2 hover:ring-slate-400'
                    }`}
                  >
                    {m.type === 'qr_code' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white border-2 border-black text-black p-1">
                        <QrCode className="w-full h-full stroke-[2.5]" />
                      </div>
                    ) : (
                      <span
                        style={{
                          fontFamily: m.style.fontFamily,
                          fontSize: `${scaledFontSize}px`,
                          fontWeight: m.style.fontWeight,
                          fontStyle: m.style.fontStyle,
                          color: m.style.color,
                          letterSpacing: `${(m.style.letterSpacing || 0) * previewScale}px`,
                          lineHeight: m.style.lineHeight || 1.3,
                        }}
                        className="truncate px-1 pointer-events-none drop-shadow-md font-black"
                      >
                        {displayVal}
                      </span>
                    )}

                    {isActive && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-yellow-300 text-black border-2 border-black font-mono font-black text-[9px] uppercase shadow-[2px_2px_0px_0px_#000000] whitespace-nowrap">
                        {m.label} ({m.style.x}%, {m.style.y}%)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Styling & Mapping Controls (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 text-xs font-mono">
          
          {/* Add Available Columns & Custom Text Buttons */}
          <div className="brutal-card p-4 space-y-3">
            <h3 className="font-black uppercase text-slate-900 dark:text-white flex items-center justify-between">
              <span>ADD FIELDS & TEXT</span>
              <span className="text-[10px] text-indigo-600 dark:text-yellow-300 font-bold">+ CLICK TO ADD</span>
            </h3>

            {/* Dynamic Columns */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Spreadsheet Columns:</span>
              <div className="flex flex-wrap gap-1.5">
                {spreadsheet.headers.map((h) => {
                  const isMapped = mappings.some((m) => m.type === 'column' && m.columnName === h);
                  return (
                    <button
                      key={h}
                      onClick={() => addColumnField(h)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border-2 border-black transition-all ${
                        isMapped
                          ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000000]'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100'
                      }`}
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>{h}</span>
                    </button>
                  );
                })}

                <button
                  onClick={addQrCodeField}
                  className="brutal-btn-cyan px-2.5 py-1 text-xs font-mono flex items-center gap-1 text-black"
                >
                  <QrCode className="w-3 h-3 stroke-[2.5]" />
                  <span>+ QR CODE</span>
                </button>
              </div>
            </div>

            {/* Custom Paragraph Presets */}
            <div className="space-y-2 pt-2 border-t-2 border-black dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Custom Body Text Presets:</span>
                </span>

                <button
                  onClick={() => addCustomTextField()}
                  className="brutal-btn-yellow px-2 py-0.5 text-[10px] font-black uppercase text-black"
                >
                  + Custom Text
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_PARAGRAPHS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => addCustomTextField(p.text, p.title)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-yellow-200 dark:hover:bg-slate-700 border-2 border-black dark:border-slate-700 text-left font-mono transition-colors"
                  >
                    <div className="font-black text-slate-900 dark:text-white text-xs">{p.title}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{p.text}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Active Field Style Property Panel */}
          {activeField ? (
            <div className="brutal-card p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-black dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-900 dark:text-yellow-300 stroke-[2.5]" />
                  <span className="font-black text-slate-900 dark:text-white uppercase truncate max-w-[180px]">
                    {activeField.label}
                  </span>
                </div>

                <button
                  onClick={() => deleteField(activeField.id)}
                  className="p-1 text-slate-900 dark:text-white hover:text-red-600 border-2 border-black rounded"
                  title="Delete field"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Precision Arrow Nudge & Coordinates Panel */}
              <div className="p-2.5 rounded-lg bg-yellow-100/70 dark:bg-slate-800/80 border-2 border-black dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Crosshair className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                    <span>NUDGE POSITION:</span>
                  </span>

                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.2)}
                      className={`px-1.5 py-0.5 rounded border border-black ${
                        nudgeStep === 0.2
                          ? 'bg-yellow-300 text-black font-black'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Fine (0.2%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(1.0)}
                      className={`px-1.5 py-0.5 rounded border border-black ${
                        nudgeStep === 1.0
                          ? 'bg-yellow-300 text-black font-black'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Coarse (1%)
                    </button>
                  </div>
                </div>

                {/* 4 Direction Nudge Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => nudgeField('up')}
                      className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors"
                      title="Nudge Up (Arrow Up)"
                    >
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => nudgeField('left')}
                        className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors"
                        title="Nudge Left (Arrow Left)"
                      >
                        <ArrowLeftIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeField('down')}
                        className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors"
                        title="Nudge Down (Arrow Down)"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeField('right')}
                        className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors"
                        title="Nudge Right (Arrow Right)"
                      >
                        <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Numeric Inputs */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">X POS (%)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="95"
                        value={activeField.style.x}
                        onChange={(e) => updateActiveFieldStyle('x', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 rounded bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Y POS (%)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="95"
                        value={activeField.style.y}
                        onChange={(e) => updateActiveFieldStyle('y', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 rounded bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono pt-0.5">
                  ⌨️ Tip: Click box & use <span className="font-bold text-black dark:text-white">↑ ↓ ← →</span> arrow keys on keyboard. Hold <span className="font-bold text-black dark:text-white">Shift</span> for 1% step.
                </p>
              </div>

              {/* Custom Text Content Textarea */}
              {activeField.type === 'custom' && (
                <div className="space-y-1 bg-yellow-50 dark:bg-slate-800 p-2.5 rounded-lg border-2 border-black dark:border-slate-700">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-yellow-500" />
                    <span>EDIT PARAGRAPH TEXT:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={activeField.customText || ''}
                    onChange={(e) => updateActiveFieldCustomText(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
                    placeholder="Type custom text..."
                  />
                </div>
              )}

              {activeField.type !== 'qr_code' && (
                <div className="space-y-3">
                  
                  {/* Font Family */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-900 dark:text-slate-200">FONT FAMILY:</label>
                    <select
                      value={activeField.style.fontFamily}
                      onChange={(e) => updateActiveFieldStyle('fontFamily', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <option key={f.value} value={f.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size & Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-slate-200">FONT SIZE ({activeField.style.fontSize}):</label>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={activeField.style.fontSize}
                        onChange={(e) => updateActiveFieldStyle('fontSize', Number(e.target.value))}
                        className="w-full accent-black dark:accent-yellow-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-slate-200">WEIGHT:</label>
                      <select
                        value={activeField.style.fontWeight}
                        onChange={(e) => updateActiveFieldStyle('fontWeight', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="normal" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Normal</option>
                        <option value="500" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Medium</option>
                        <option value="600" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Semi Bold</option>
                        <option value="700" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Bold</option>
                        <option value="800" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Extra Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 dark:text-slate-200">TEXT COLOR:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeField.style.color}
                        onChange={(e) => updateActiveFieldStyle('color', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-2 border-black p-0.5"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => updateActiveFieldStyle('color', c.value)}
                            style={{ backgroundColor: c.value }}
                            className={`w-5 h-5 rounded-full border-2 border-black hover:scale-110 transition-transform ${
                              activeField.style.color === c.value ? 'ring-2 ring-yellow-400' : ''
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alignment & Case */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-slate-200">ALIGNMENT:</label>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border-2 border-black dark:border-slate-700">
                        <button
                          onClick={() => updateActiveFieldStyle('textAlign', 'left')}
                          className={`flex-1 p-1 rounded border-2 border-black flex justify-center ${
                            activeField.style.textAlign === 'left' ? 'bg-yellow-300 text-black font-black' : 'text-slate-500'
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => updateActiveFieldStyle('textAlign', 'center')}
                          className={`flex-1 p-1 rounded border-2 border-black flex justify-center ${
                            activeField.style.textAlign === 'center' ? 'bg-yellow-300 text-black font-black' : 'text-slate-500'
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => updateActiveFieldStyle('textAlign', 'right')}
                          className={`flex-1 p-1 rounded border-2 border-black flex justify-center ${
                            activeField.style.textAlign === 'right' ? 'bg-yellow-300 text-black font-black' : 'text-slate-500'
                          }`}
                        >
                          <AlignRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-900 dark:text-slate-200">CASE:</label>
                      <select
                        value={activeField.style.textTransform}
                        onChange={(e) => updateActiveFieldStyle('textTransform', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="none" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Normal</option>
                        <option value="uppercase" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">UPPERCASE</option>
                        <option value="capitalize" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Capitalize</option>
                      </select>
                    </div>
                  </div>

                  {/* Horizontal Auto Center Shortcut */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        updateActiveFieldStyle('x', 15);
                        updateActiveFieldStyle('width', 70);
                        updateActiveFieldStyle('textAlign', 'center');
                      }}
                      className="w-full py-1.5 rounded-lg brutal-btn-yellow text-xs font-mono font-black uppercase text-black"
                    >
                      CENTER HORIZONTALLY
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="brutal-card p-4 text-center text-slate-600 dark:text-slate-400 font-mono font-bold text-xs">
              Click any text box on the canvas to customize typography, colors & position.
            </div>
          )}

        </div>

      </div>

      {/* Navigation CTA Bar */}
      <div className="flex items-center justify-between p-4 brutal-card bg-yellow-100 dark:bg-slate-900">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs border-2 border-black dark:border-slate-700"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO UPLOAD</span>
        </button>

        <button
          onClick={onProceed}
          className="flex items-center gap-1.5 px-6 py-2.5 brutal-btn-yellow text-xs font-mono font-black uppercase text-black"
        >
          <span>CONTINUE TO EXPORT</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

    </div>
  );
};
