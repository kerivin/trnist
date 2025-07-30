import Translator, { TranslationResult } from '../translator';

export class YandexOptions {
  iamToken?: string;
  apiKey?: string;
  folderId?: string;
}

export default class YandexTranslator implements Translator<YandexOptions> {
  async translate(text: string, from: string, to: string, options: YandexOptions): Promise<TranslationResult> {
    const endpoint = 'https://translate.api.cloud.yandex.net/translate/v2/translate';

    if (!options.apiKey && !options.iamToken) {
      throw new Error('Yandex API-key or IAM-token is required');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `${options.iamToken ? 'Bearer' : 'Api-Key'} ${options.apiKey}`,
    };

    const body: Record<string, any> = {
      sourceLanguageCode: from,
      targetLanguageCode: to,
      texts: [text],
      format: 'PLAIN_TEXT',
    };

    if (options.iamToken && options.folderId) {
      body.folderId = options.folderId;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Yandex API responded with ${res.status}: ${error}`);
    }

    const json = await res.json();
    const translated = json.translations?.[0]?.text;

    if (!translated) {
      throw new Error('Yandex API did not return a translation');
    }

    return {
      text: translated,
      raw: json,
    };
  }
}
