import React, { useEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { ImageCache } from '@/utils/image-cache';
import { CanvasPool } from '@/utils/canvas-pool';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerOptions {
  url: string;
  scale?: number;
}

const PdfViewer: React.FC<PdfViewerOptions> = ({ url }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const imageCache = useRef(new ImageCache(20 * 1024 * 1024));
  const canvasPool = useRef(new CanvasPool());
  const pdfInstance = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const renderTasks = useRef<{[key: number]: pdfjs.RenderTask | null}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPDF = async () => {
      setIsLoading(true);
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
        
        if (!isMounted) return;
        
        pdfInstance.current = pdf;
        setNumPages(pdf.numPages);
        await renderPage(currentPage);
        prerenderPages(currentPage);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      renderTasks.current[currentPage]?.cancel();
      pdfInstance.current?.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!pdfInstance.current) return;
    renderPage(currentPage);
    prerenderPages(currentPage);
  }, [currentPage, dimensions]);

  const prerenderPages = async (pageNum: number) => {
    if (!numPages) return;

    const pagesToRender = [
      pageNum - 2,
      pageNum - 1,
      pageNum + 1,
      pageNum + 2
    ].filter(page => page >= 1 && page <= numPages);

    await Promise.all(pagesToRender.map(page => renderPage(page, true)));
  };

  const renderPage = async (pageNum: number, isPrerender = false) => {
    if (!pdfInstance.current || dimensions.width <= 0 || dimensions.height <= 0) return;

    renderTasks.current[pageNum]?.cancel();
    let canvas: HTMLCanvasElement | null = null;

    try {
      const page = await pdfInstance.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      const scaledViewport = page.getViewport({ 
        scale: dimensions.width / viewport.width * 2 * window.devicePixelRatio,
        rotation: 0
      });
      
      console.log("[PDF] size: %dx%d", scaledViewport.width, scaledViewport.height);
      const cached = imageCache.current.get(pageNum, scaledViewport.width, scaledViewport.height);

      const drawOnCanvas = (image: CanvasImageSource) =>
      {
        if (!isPrerender && canvasRef.current) {
          canvasRef.current.width = scaledViewport.width;
          canvasRef.current.height = scaledViewport.height;
          const ctx = canvasRef.current.getContext('2d')!;
          ctx.drawImage(image, 0, 0);
        }
      };

      if (cached) {
        drawOnCanvas(cached);
        return;
      }

      const canvas = canvasPool.current.get();
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      renderTasks.current[pageNum] = page.render({
        canvasContext: canvas.getContext('2d')!,
        canvas,
        viewport: scaledViewport,
        intent: 'display',
        annotationMode: pdfjs.AnnotationMode.ENABLE,
      });

      await renderTasks.current[pageNum]?.promise;

      const bitmap = await createImageBitmap(canvas);
      imageCache.current.set(pageNum, bitmap);

      drawOnCanvas(canvas);

    } catch (error) {
      console.warn(`Error rendering page ${pageNum}:`, error);
    } finally {
      if (canvas) canvasPool.current.return(canvas);
      delete renderTasks.current[pageNum];
    }
  };

  const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas && pdfInstance.current) {
      renderPage(currentPage);
      prerenderPages(currentPage);
    }
  };

  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => numPages && currentPage < numPages && setCurrentPage(currentPage + 1);

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <div className="pdf-controls" style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={goToPrevPage} style={{ background: 'transparent', border: '0', cursor: 'pointer' }} disabled={currentPage <= 1}>
          <RiArrowLeftLine size={20}/>
        </button>
        <span>
          {currentPage}/{numPages || '--'}
        </span>
        <button onClick={goToNextPage} style={{ background: 'transparent', border: '0', cursor: 'pointer' }} disabled={!numPages || currentPage >= numPages}>
          <RiArrowRightLine size={20} />
        </button>
      </div>
      
      <div className="pdf-container" style={{ position: 'relative', height: '100%', width: '100%', overflow: 'auto' }}>
        <canvas 
          ref={handleCanvasRef}
          className="pdf-canvas" 
          style={{ 
            display: 'block',
            backgroundColor: 'transparent',
            maxWidth: '100%',
            // maxHeight: '100%',
            margin: '0 auto'
          }} 
        />
      </div>
    </div>
  );
};

export default PdfViewer;