import Translator, { TranslationResult } from '../translator';

export class YandexOptions {
  iamToken?: string;
  apiKey?: string;
  folderId?: string;
}

export default class YandexTranslator implements Translator<YandexOptions> {
  async translate(text: string, from: string, to: string, options: YandexOptions): Promise<TranslationResult>
  {

    if (!options.apiKey || !options.iamToken) {
      throw new Error('Yandex API-key or IAM-token is required');
    }

    const res = await fetch('https://translate.api.cloud.yandex.net/translate/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${options.iamToken ? 'Bearer' : 'Api-Key'} ${options.apiKey}`,
      },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        folder_id: options.folderId,
      }),
    });

    const json = await res.json();
    const translated = json.translations?.[0]?.text;

    return {
      text: translated,
      raw: json,
    };
  }
}
