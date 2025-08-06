import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import * as pdfjs from 'pdfjs-dist';
import {
  PDFViewer as PDFJSViewer,
  EventBus,
  PDFLinkService,
  PDFFindController,
  TextLayerBuilder
} from 'pdfjs-dist/web/pdf_viewer.mjs';
// import 'pdfjs-dist/web/pdf_viewer.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerProps {
  url: string;
}

export const PdfViewer = ({ url }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PDFJSViewer>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const updateScale = useCallback(() => {
    if (!containerRef.current || !pdfDocRef.current || !viewerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    
    pdfDocRef.current.getPage(currentPage).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const scale = 0.9 * containerWidth / viewport.width;
      viewerRef.current!.currentScale = scale;
    });
  }, [currentPage]);

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

    const loadingTask = pdfjs.getDocument({
      url: url,
      cMapPacked: true,
      cMapUrl: './cmaps/',
      wasmUrl: './wasm/',
    });

    loadingTask.promise.then((pdf: pdfjs.PDFDocumentProxy) => {
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      
      viewer.setDocument(pdf);
      linkService.setDocument(pdf, null);
      findController.setDocument(pdf);
      
      updateScale();
    });

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      viewer.cleanup();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, updateScale]);

  const goToPage = (pageNumber: number) => {
    if (!viewerRef.current || !numPages) return;

    const validPage = Math.max(1, Math.min(pageNumber, numPages));
    viewerRef.current.currentPageNumber = validPage;
    setCurrentPage(validPage);
    setTimeout(updateScale, 0);
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
        <div id="viewer" className="pdf-viewer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} />
      </div>
    </div>
  );
};

export default PdfViewer;