export interface TranslationResult {
  text: string;

  examples?: string[];
  confidence?: number;
  raw?: any;
}

export default interface Translator<Options = unknown> {
  translate(text: string, from: string, to: string, options?: Options): Promise<TranslationResult>;
}