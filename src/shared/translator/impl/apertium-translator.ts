import Translator, { TranslationResult } from '../translator';

export class ApertiumOptions {
}

export default class ApertiumTranslator implements Translator {
  async translate(text: string, from: string, to: string, options: ApertiumOptions = new ApertiumOptions()): Promise<TranslationResult> {
    const langpair = `${from}|${to}`;
    const url = `https://apertium.org/apy/translate?q=${encodeURIComponent(text)}&langpair=${langpair}`;

    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data.responseData?.translatedText || '',
      raw: data
    };
  }
}
