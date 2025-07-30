import Translator, { TranslationResult } from "../translator";

export class GoogleOptions {
  client: string = 'gtx';
};

export default class GoogleTranslator implements Translator<GoogleOptions> {
  async translate(text: string, from: string, to: string, options: GoogleOptions = new GoogleOptions()): Promise<TranslationResult> {
    const url = `https://translate.googleapis.com/translate_a/single?client=${options.client}&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data[0].map((d: any[]) => d[0]).join(''),
      raw: data
    };
  }
}
