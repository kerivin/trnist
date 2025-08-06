import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import * as pdfjs from 'pdfjs-dist';
import {
  PDFViewer as PDFJSViewer,
  EventBus,
  PDFLinkService,
  PDFFindController,
} from 'pdfjs-dist/web/pdf_viewer.mjs';
import { PDFRenderingQueue } from 'pdfjs-dist/types/web/pdf_rendering_queue';
// import 'pdfjs-dist/web/pdf_viewer.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerProps {
  url: string;
}

export const PdfViewer = ({ url }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PDFJSViewer>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const viewerElement = container.querySelector('#viewer') as HTMLDivElement;

    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const findController = new PDFFindController({ linkService, eventBus });

    const viewer = new PDFJSViewer({
      container,
      viewer: viewerElement,
      eventBus,
      linkService,
      findController,
      textLayerMode: 0,
    });

    viewerRef.current = viewer;
    linkService.setViewer(viewer);

    console.log("[PDF] Loading ", url);

    const loadingTask = pdfjs.getDocument({
          url: url,
          cMapPacked: true,
          cMapUrl: './cmaps/',
          wasmUrl: './wasm/',
        });

    loadingTask.promise.then((pdf: pdfjs.PDFDocumentProxy) => {
      console.log("[PDF] Ready %s pages", pdf.numPages);
      setNumPages(pdf.numPages);
      viewer.setDocument(pdf);
      linkService.setDocument(pdf, null);
    });

    const handleResize = () => {
      if (viewerRef.current) {
        viewerRef.current.currentScale = 1.2;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.cleanup();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url]);

  const goToPage = (pageNumber: number) =>
  {
    if (!viewerRef.current || !numPages) return;

    const validPage = Math.max(1, Math.min(pageNumber, numPages));
    viewerRef.current.currentPageNumber = validPage;
    setCurrentPage(validPage);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'clip' }}>
      <div className="pdf-controls" style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px'
      }}>
        <button 
          onClick={() => goToPage(currentPage - 1)} 
          style={{ background: 'transparent', border: '0', cursor: 'pointer' }} 
          disabled={currentPage <= 1}
        >
          <RiArrowLeftLine size={20}/>
        </button>
        <span style={{ margin: '0 8px' }}>
          {currentPage}/{numPages || '--'}
        </span>
        <button 
          onClick={() => goToPage(currentPage + 1)} 
          style={{ background: 'transparent', border: '0', cursor: 'pointer' }} 
          disabled={!numPages || currentPage >= numPages}
        >
          <RiArrowRightLine size={20} />
        </button>
      </div>

      <div ref={containerRef} style={{ position: 'absolute', overflow: 'auto', width: '100%', height: '100%' }}>
        <div id="viewer" className="pdf-viewer" />
      </div>
    </div>
  );
};

export default PdfViewer;