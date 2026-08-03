import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface RenderedPdfPage {
  dataUrl: string;
  width: number;
  height: number;
  numPages: number;
}

/**
 * Loads a PDF file and renders the specified page to a high-DPI image Data URL.
 */
export async function renderPdfPageToDataUrl(
  pdfBuffer: ArrayBuffer,
  pageNumber: number = 1,
  scale: number = 2.0
): Promise<RenderedPdfPage> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      throw new Error('Failed to get 2D rendering context for PDF page');
    }

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext as any).promise;

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: viewport.width / scale,
      height: viewport.height / scale,
      numPages,
    };
  } catch (err) {
    console.error('Error rendering PDF:', err);
    throw new Error('Failed to process PDF template. Please ensure it is a valid PDF document.');
  }
}
