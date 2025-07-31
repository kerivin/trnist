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
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let pdfInstance: pdfjs.PDFDocumentProxy | null = null;
    let renderTask: pdfjs.RenderTask | null = null;

    const loadPDF = async () => {
      setIsLoading(true);
      setRenderError(null);
      try {
        const pdf = await pdfjs.getDocument({
          url,
          verbosity: 1,
          cMapPacked: true,
          cMapUrl: './cmaps/',
          wasmUrl: './wasm/',
          disableFontFace: false,
          useSystemFonts: true,
        }).promise;
        
        pdfInstance = pdf;
        setNumPages(pdf.numPages);
        await renderPage(pdf, currentPage);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setRenderError('Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ 
          scale: scale * window.devicePixelRatio
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = Math.floor(viewport.height);
        canvas.width = Math.floor(viewport.width);
        canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;
        canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;

        try {
          renderTask = page.render({
            canvasContext: context,
            canvas,
            viewport,
            intent: 'display',
            annotationMode: pdfjs.AnnotationMode.ENABLE,
          });
          await renderTask.promise;
        } catch (renderError) {
          console.warn('Primary render failed, attempting fallback:', renderError);
          context.clearRect(0, 0, canvas.width, canvas.height);
          renderTask = page.render({
            canvasContext: context,
            canvas,
            viewport,
            intent: 'display',
            annotationMode: pdfjs.AnnotationMode.ENABLE,
          });
          await renderTask.promise;
          setRenderError('Some images could not be displayed');
        }
      } catch (error) {
        console.error('Error rendering page:', error);
        setRenderError('Failed to render page');
      }
    };

    loadPDF();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      if (pdfInstance) {
        pdfInstance.destroy();
      }
    };
  }, [url, currentPage, scale]);

  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => numPages && currentPage < numPages && setCurrentPage(currentPage + 1);

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
      
      <div className="pdf-container" style={{ position: 'relative' }}>
        <canvas 
          ref={canvasRef} 
          className="pdf-canvas" 
          style={{ 
            display: 'block',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd'
          }} 
        />
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '4px'
          }}>
            Loading PDF...
          </div>
        )}
        {renderError && !isLoading && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 10px',
            background: 'rgba(255,0,0,0.7)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.9em'
          }}>
            {renderError}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;