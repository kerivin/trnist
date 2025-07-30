import Translator, { TranslationResult } from '../translator';

export class YandexOptions {
  format: 'text' | 'html' = 'text';
}

export default class YandexTranslator implements Translator<YandexOptions> {
  async translate(text: string, from: string, to: string, options: YandexOptions = new YandexOptions()): Promise<TranslationResult> {
    const url = `https://translate.yandex.net/api/v1/tr.json/translate?lang=${from}-${to}&text=${encodeURIComponent(text)}&srv=tr-text&reason=paste`;
    const res = await fetch(url);
    const data = await res.json();

    return {
      text: data.text.join(' '),
      raw: data
    };
  }
}