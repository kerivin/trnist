import Translator from '../../../shared/translator';

export default class MyMemoryTranslator implements Translator {
  async translate(text: string, from = 'auto', to = 'en'): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json() as { responseData: { translatedText: string } };
    return data.responseData.translatedText;
  }
}
