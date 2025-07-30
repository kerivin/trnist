import Translator, { TranslationResult } from '../translator';

export class MyMemoryOptions {
  onlyPrivate?: boolean = false;
  key?: string;
  mt?: boolean = true;
  email?: string;
};

export default class MyMemoryTranslator implements Translator<MyMemoryOptions> {
  async translate(text: string, from: string, to: string, options: MyMemoryOptions = new MyMemoryOptions()): Promise<TranslationResult>
  {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      + `&onlyprivate=${options.onlyPrivate === true ? 1 : 0}`
      + `&mt=${options.mt === true ? 1 : 0}`
      + (options.key ? `&key=${encodeURIComponent(options.key)}` : ``)
      + (options.email ? `&de=${encodeURIComponent(options.email)}` : ``);

    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data.responseData.translatedText,
      raw: data
    };
  }
}
