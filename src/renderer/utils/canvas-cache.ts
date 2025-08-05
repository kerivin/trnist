interface CachedCanvas {
  canvas: HTMLCanvasElement;
  lastUsed: number;
}

export class CanvasCache {
  private cache = new Map<number, CachedCanvas>();
  private currentSize = 0;

  constructor(private maxSizeBytes: number) {}

  set(pageNum: number, canvas: HTMLCanvasElement): void {
    const size = this.getCanvasSize(canvas);
    this.ensureSpace(size);
    this.delete(pageNum);
    
    this.cache.set(pageNum, {
      canvas,
      lastUsed: performance.now()
    });
    this.currentSize += size;
  }

  get(pageNum: number, width: number, height: number): HTMLCanvasElement | undefined {
    const entry = this.cache.get(pageNum);
    
    if (entry && 
        entry.canvas.width === width && 
        entry.canvas.height === height) {
      entry.lastUsed = performance.now();
      return entry.canvas;
    }
    
    return undefined;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private getCanvasSize(canvas: HTMLCanvasElement): number {
    return canvas.width * canvas.height * 4;
  }

  private delete(pageNum: number): void {
    const existing = this.cache.get(pageNum);
    if (existing) {
      this.currentSize -= this.getCanvasSize(existing.canvas);
      this.cache.delete(pageNum);
    }
  }

  private ensureSpace(requiredSpace: number): void {
    if (this.currentSize + requiredSpace <= this.maxSizeBytes) {
      return;
    }

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    for (const [pageNum, entry] of entries) {
      this.delete(pageNum);
      if (this.currentSize + requiredSpace <= this.maxSizeBytes) {
        break;
      }
    }
  }
}