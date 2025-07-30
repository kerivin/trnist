import Translator from '../../../shared/translator';

export default class YandexTranslator implements Translator {
  private async getSID(): Promise<string> {
    const res = await fetch('https://translate.yandex.com/');
    const html = await res.text();
    const sidMatch = html.match(/SID: '([^']+)'/);
    if (!sidMatch) throw new Error('Yandex SID not found');
    return sidMatch[1];
  }

  async translate(text: string, from = 'auto', to = 'en'): Promise<string> {
    const sid = await this.getSID();
    const url = 'https://translate.yandex.com/api/v1/tr.json/translate';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        id: `${sid}-0-0`,
        srv: 'tr-text',
        lang: `${from}-${to}`,
        reason: 'paste',
        format: 'text',
        text
      }).toString()
    });

    const json = await res.json() as any;
    if (!json.text) throw new Error('Yandex response malformed');
    return json.text.join(' ');
  }
}