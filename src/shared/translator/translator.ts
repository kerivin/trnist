export interface TranslationResult {
  text: string;

  examples?: string[];
  confidence?: number;
  raw?: any;
}

export default interface Translator {
  translate(text: string, from: string, to: string): Promise<TranslationResult>;
}