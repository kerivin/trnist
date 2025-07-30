import Translator, { TranslationResult } from "./translator";

export default class GoogleTranslator implements Translator {
  async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data[0].map((d: any[]) => d[0]).join(''),
      raw: data
    };
  }
}
