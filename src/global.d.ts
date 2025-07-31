export {};

declare global {
  interface Window {
    pdfjsWorker: {
      path: string;
    };
  }
}