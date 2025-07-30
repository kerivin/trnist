export {};

declare global {
  interface Window {
    translatorAPI: {
      google: (text: string, from?: string, to?: string) => Promise<string>;
    };
  }
}
