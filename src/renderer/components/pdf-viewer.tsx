import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { CanvasCache } from '@/utils/canvas-cache';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerOptions {
  url: string;
  scale?: number;
}

const PAGE_BUFFER: number = 4;
const CACHE_SIZE_MB: number = 30;

const PdfViewer: React.FC<PdfViewerOptions> = ({ url }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageHeights, setPageHeights] = useState<number[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);
  const [visiblePages, setVisiblePages] = useState<number[]>([1]);

  const canvasCache = useRef(new CanvasCache(CACHE_SIZE_MB * 1024 * 1024));
  const pdfInstance = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const renderTasks = useRef<{[key: number]: pdfjs.RenderTask | null}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const visiblePagesRef = useRef<Set<number>>(new Set([1]));
  const pendingRenderRequests = useRef<Set<number>>(new Set());

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
  }, [isLoading]);

  const updateVisiblePages = useCallback(() => {
    if (!contentRef.current || !numPages) return;
    
    const { scrollTop, clientHeight } = contentRef.current;
    const startY = scrollTop - (PAGE_BUFFER * clientHeight);
    const endY = scrollTop + clientHeight * (1 + PAGE_BUFFER);
    
    const newVisiblePages = new Set<number>();
    let accumulatedHeight = 0;
    
    for (let i = 0; i < pageHeights.length; i++) {
      const pageEnd = accumulatedHeight + pageHeights[i];
      if (pageEnd > startY && accumulatedHeight < endY) {
        newVisiblePages.add(i + 1);
      }
      accumulatedHeight = pageEnd;
    }

    visiblePagesRef.current = newVisiblePages;
    setVisiblePages(Array.from(newVisiblePages));

    console.log("[PDF] visible pages: ", newVisiblePages);
  }, [numPages, pageHeights]);

  const updateLayout = () => {
    if (!contentRef.current || !numPages) return;

    const scrollTop = contentRef.current!.scrollTop;
    let accumulatedHeight = 0;
    let newCurrentPage = 1;
    for (let i = 0; i < pageHeights.length; i++) {
      accumulatedHeight += pageHeights[i];
      if (scrollTop < accumulatedHeight) {
        newCurrentPage = i + 1;
        break;
      }
    }

    if (newCurrentPage !== currentPage) {
      setCurrentPage(newCurrentPage);
    }

    updateVisiblePages();
  };

  useEffect(() => {
    const handleScroll = () => {
      updateLayout();
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentPage, numPages, pageHeights]);

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

        if (pageContainerRef.current) {
          pageContainerRef.current.innerHTML = '';
          const fragment = document.createDocumentFragment();
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page-container';
            pageDiv.dataset.pageNumber = i.toString();
            pageDiv.style.position = 'absolute';
            pageDiv.style.width = '100%';
            pageDiv.style.left = '0';
            fragment.appendChild(pageDiv);
          }
          
          pageContainerRef.current.appendChild(fragment);
        }

        setNumPages(pdf.numPages);
        await calculatePageHeights(pdf);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      cancelAllRenderTasks();
      pdfInstance.current?.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!pdfInstance.current || dimensions.width <= 0) return;
    calculatePageHeights(pdfInstance.current);
  }, [dimensions, numPages]);

  useEffect(() => {
    updateLayout();
  }, [visiblePages, dimensions]);

  useEffect(() => {
    if (!pdfInstance.current || dimensions.width <= 0) return;

    pendingRenderRequests.current.forEach(pageNum => {
      if (!visiblePagesRef.current.has(pageNum)) {
        renderTasks.current[pageNum]?.cancel();
        pendingRenderRequests.current.delete(pageNum);
      }
    });

    visiblePagesRef.current.forEach(pageNum => {
      if (!pendingRenderRequests.current.has(pageNum)) {
        pendingRenderRequests.current.add(pageNum);
        renderPage(pageNum).finally(() => {
          pendingRenderRequests.current.delete(pageNum);
        });
      }
    });
  }, [visiblePages, dimensions]);

  const calculatePageHeights = async (pdf: pdfjs.PDFDocumentProxy) => {
    const heights = [];
    let total = 0;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const scaledHeight = dimensions.width / viewport.width * viewport.height;
      heights.push(scaledHeight);
      total += scaledHeight;
    }
    
    setPageHeights(heights);
    setTotalHeight(total);
    
    if (pageContainerRef.current) {
      let accumulatedHeight = 0;
      const pageContainers = pageContainerRef.current.children;
      
      for (let i = 0; i < pageContainers.length; i++) {
        const pageContainer = pageContainers[i] as HTMLElement;
        pageContainer.style.top = `${accumulatedHeight}px`;
        pageContainer.style.height = `${heights[i]}px`;
        accumulatedHeight += heights[i];
      }
    }
  };

  const cancelAllRenderTasks = () => {
    Object.values(renderTasks.current).forEach(task => task?.cancel());
    renderTasks.current = {};
    pendingRenderRequests.current.clear();
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfInstance.current || dimensions.width <= 0 || dimensions.height <= 0) return;
    if (!visiblePagesRef.current.has(pageNum)) return;

    renderTasks.current[pageNum]?.cancel();

    try {
      const page = await pdfInstance.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const scale = dimensions.width / viewport.width;
      const scaledViewport = page.getViewport({ scale: 2 * scale, rotation: 0 });

      const pageContainer = pageContainerRef.current?.querySelector(`[data-page-number="${pageNum}"]`) as HTMLElement;
      if (!pageContainer) return;

      const cached = canvasCache.current.get(pageNum, scaledViewport.width, scaledViewport.height);
      if (cached) {
        updatePageContainer(pageContainer, cached, scaledViewport, scale, page);
        return;
      }

      const canvas = document.createElement('canvas');
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
      canvasCache.current.set(pageNum, canvas);
      
      updatePageContainer(pageContainer, bitmap, scaledViewport, scale, page);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rendering cancelled')) {
        return;
      }
      console.warn(`Error rendering page ${pageNum}:`, error);
    } finally {
      delete renderTasks.current[pageNum];
    }
  };

  const updatePageContainer = (
    container: HTMLElement,
    image: CanvasImageSource,
    viewport: pdfjs.PageViewport,
    scale: number,
    page: pdfjs.PDFPageProxy
  ) => {
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);

    const textLayer = document.createElement('div');
    textLayer.className = 'pdf-text';
    textLayer.style.color = 'transparent';
    textLayer.style.cursor = 'text';
    textLayer.style.lineHeight = '0';
    textLayer.style.setProperty('--total-scale-factor', `${scale}`);

    container.appendChild(canvas);
    container.appendChild(textLayer);

    page.getTextContent().then(textContent => {
      if (!container.contains(textLayer)) return;

      const text = new pdfjs.TextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport,
      });
      text.render();
    });
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const scrollToPage = (pageNum: number) => {
    if (contentRef.current && pageNum >= 1 && pageNum <= (numPages || 0)) {
      let offset = 0;
      for (let i = 0; i < pageNum - 1; i++) {
        offset += pageHeights[i] || 0;
      }
      contentRef.current.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
      setCurrentPage(pageNum);
      updateVisiblePages();
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        height: '100%'
      }}
    >
      <div className="pdf-controls" style={{ 
        display: 'flex', 
        alignItems: 'center',
        padding: '8px'
      }}>
        <button 
          onClick={goToPrevPage} 
          style={{ background: 'transparent', border: '0', cursor: 'pointer' }} 
          disabled={currentPage <= 1}
        >
          <RiArrowLeftLine size={20}/>
        </button>
        <span style={{ margin: '0 8px' }}>
          {currentPage}/{numPages || '--'}
        </span>
        <button 
          onClick={goToNextPage} 
          style={{ background: 'transparent', border: '0', cursor: 'pointer' }} 
          disabled={!numPages || currentPage >= numPages}
        >
          <RiArrowRightLine size={20} />
        </button>
      </div>
      
      <div 
        ref={contentRef} 
        className="pdf-container" 
        style={{ 
          position: 'relative', 
          overflowY: 'auto',
          overflowX: 'clip',
          width: '100%',
          flex: 1
        }}
      >
        <div 
          ref={pageContainerRef}
          style={{ 
            position: 'relative', 
            height: totalHeight,
            width: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default PdfViewer;