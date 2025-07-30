import Translator, { TranslationResult } from './translator';

export default class MyMemoryTranslator implements Translator {
  async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data.responseData.translatedText,
      // examples: data.matches?.map((m: any) => m.translation),
      raw: data
    };
  }
}
