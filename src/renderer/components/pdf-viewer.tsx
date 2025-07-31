import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = window.pdfjsWorker.path;

interface PdfViewerOptions
{
  url: string;
  scale?: number;
  onDocumentLoadSuccess?: (numPages: number) => void;
  onPageLoadSuccess?: (pageNumber: number) => void;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerOptions> = ({ url, scale = 1.0, onDocumentLoadSuccess, onPageLoadSuccess, className = '' }) =>
{
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() =>
  {
    const loadPDF = async () =>
    {
      try {
        setIsLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        pdfDocRef.current = pdfDoc;

        setNumPages(pdfDoc.numPages);
        onDocumentLoadSuccess?.(pdfDoc.numPages);

        await renderPage(currentPage, scale);
      } catch (err) {
        console.error('PDF loading error:', err);
        setError('Failed to load PDF document');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    return () =>
    {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [url]);

  useEffect(() =>
  {
    if (pdfDocRef.current && numPages) {
      renderPage(currentPage, scale);
    }
  }, [currentPage, scale]);

  const renderPage = async (pageNum: number, scaleValue: number) =>
  {
    if (!pdfDocRef.current || !canvasRef.current || !textLayerRef.current) return;

    try {
      setIsLoading(true);

      const page = await pdfDocRef.current.getPage(pageNum);
      onPageLoadSuccess?.(pageNum);

      const viewport = page.getViewport({ scale: scaleValue });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      textLayerRef.current.innerHTML = '';

      const renderContext = {
        canvasContext: context,
        viewport,
        canvas
      };

      await page.render(renderContext).promise;

      const textContent = await page.getTextContent();
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerRef.current,
        viewport: viewport
      })
      await textLayer.render();

      setIsLoading(false);
    } catch (err) {
      console.error('Page rendering error:', err);
      setError('Failed to render PDF page');
      setIsLoading(false);
    }
  };

  const goToPrevPage = () =>
  {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () =>
  {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={`pdf-viewer-container ${className}`}>
      {isLoading && (
        <div className="pdf-loading-overlay">
          <div className="pdf-loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="pdf-error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="pdf-controls">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous Page
        </button>
        <span>
          Page {currentPage} of {numPages || '--'}
        </span>
        <button
          onClick={goToNextPage}
          disabled={!numPages || currentPage >= numPages || isLoading}
        >
          Next Page
        </button>
      </div>

      <div className="pdf-canvas-container">
        <canvas ref={canvasRef} className="pdf-canvas" />
        <div ref={textLayerRef} className="pdf-text-layer" />
      </div>
    </div>
  );
};

export default PdfViewer;