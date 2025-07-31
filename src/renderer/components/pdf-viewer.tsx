import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
interface PdfViewerOptions {
  url: string;
  scale?: number;
}

const PdfViewer: React.FC<PdfViewerOptions> = ({ url, scale = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const pdf = await pdfjs.getDocument(url).promise;
        setNumPages(pdf.numPages);
        await renderPage(pdf, currentPage);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport: viewport,
      }).promise;
    };

    loadPDF();
  }, [url, currentPage, scale]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="pdf-viewer">
      
      <div className="pdf-controls">
        <button onClick={goToPrevPage} disabled={currentPage <= 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {numPages || '--'}
        </span>
        <button 
          onClick={goToNextPage} 
          disabled={!numPages || currentPage >= numPages}
        >
          Next
        </button>
      </div>
      
      <canvas ref={canvasRef} className="pdf-canvas" />

      {isLoading && <div>Loading PDF...</div>}
    </div>
  );
};

export default PdfViewer;