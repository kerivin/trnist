import Translator, { TranslationResult } from '../translator';

export class LibreTranslateOptions {
  endpoint: string = 'https://libretranslate.com';
  apiKey?: string;
}

export default class LibreTranslateTranslator implements Translator<LibreTranslateOptions> {
  async translate(text: string, from: string, to: string, options: LibreTranslateOptions = new LibreTranslateOptions()): Promise<TranslationResult>
  {
    const res = await fetch(`${options.endpoint}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        api_key: options.apiKey,
      })
    });

    const data = await res.json();

    return {
      text: data.translatedText || '',
      raw: data
    };
  }
}
