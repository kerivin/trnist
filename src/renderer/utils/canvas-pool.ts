export class CanvasPool
{
  private pool: HTMLCanvasElement[] = [];

  get(): HTMLCanvasElement
  {
    const canvas = this.pool.pop() ?? document.createElement('canvas');
    return canvas;
  }

  return(canvas: HTMLCanvasElement): void
  {
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.pool.push(canvas);
  }

  clear(): void
  {
    this.pool.forEach(canvas =>
    {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    });
    this.pool = [];
  }
}