interface CachedImage
{
  bitmap: ImageBitmap;
  lastUsed: number;
}

export class ImageCache
{
  private cache = new Map<number, CachedImage>();
  private currentSize = 0;

  constructor(private maxSizeBytes: number) {}

  set(pageNum: number, bitmap: ImageBitmap): void
  {
    const size = this.getSize(bitmap);
    if (this.currentSize + size > this.maxSizeBytes) {
      this.purge(size);
    }
    this.delete(pageNum);
    this.cache.set(pageNum, {
      bitmap,
      lastUsed: performance.now(),
    });
    this.currentSize += size;
  }

  get(pageNum: number, width: number, height: number): ImageBitmap | undefined
  {
    const entry = this.cache.get(pageNum);
    if (!entry || entry.bitmap.width != width || entry.bitmap.height != height)
      return undefined;

    entry.lastUsed = performance.now();
    return entry.bitmap;
  }

  clear(): void
  {
    for (const entry of this.cache.values()) {
      entry.bitmap.close();
    }
    this.cache.clear();
    this.currentSize = 0;
  }

  private getSize(b: ImageBitmap): number
  {
    return Math.ceil(b.width * b.height * 4);
  }

  private delete(pageNum: number): void
  {
    const existing = this.cache.get(pageNum);
    if (existing) {
      existing.bitmap.close();
      this.currentSize -= this.getSize(existing.bitmap);
      this.cache.delete(pageNum);
    }
  }

  private purge(requiredSpace: number): void
  {
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