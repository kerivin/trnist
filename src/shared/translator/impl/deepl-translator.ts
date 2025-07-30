import Translator, { TranslationResult } from '../translator';

export class DeepLOptions {
  apiKey?: string;
  splitSentences: string = '1';
  preserveFormatting: string = '0';
}

export default class DeepLTranslator implements Translator<DeepLOptions> {
  async translate(text: string, from: string, to: string, options: DeepLOptions = new DeepLOptions()): Promise<TranslationResult>
  {
    if (options.apiKey) {
      return await this.translateOfficialAPI(text, from, to, options.apiKey, options);
    } else {
      return await this.translateExperimental(text, from, to, options);
    }
  }

  private async translateOfficialAPI(text: string, from: string, to: string, apiKey: string, options: DeepLOptions): Promise<TranslationResult>
  {
    const url = 'https://api-free.deepl.com/v2/translate';

    const params = new URLSearchParams();
    params.append('auth_key', apiKey);
    params.append('text', text);
    params.append('source_lang', from.toUpperCase());
    params.append('target_lang', to.toUpperCase());
    params.append('split_sentences', options.splitSentences);
    params.append('preserve_formatting', options.preserveFormatting);

    const res = await fetch(url, {
      method: 'POST',
      body: params,
    });

    if (!res.ok) {
      throw new Error(`DeepL API error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      text: data?.translations?.[0]?.text || '',
      raw: data,
    };
  }

  private async translateExperimental(
    text: string,
    from: string,
    to: string,
    options: DeepLOptions
  ): Promise<TranslationResult> {
    const url = 'https://www.deepl.com/jsonrpc';

    const body = {
      jsonrpc: '2.0',
      method: 'LMT_handle_texts',
      id: Date.now(),
      params: {
        texts: [
          {
            text,
            requestAlternatives: 3,
          },
        ],
        splitting: 'newlines',
        lang: {
          source_lang_user_selected: from.toUpperCase(),
          target_lang: to.toUpperCase(),
        },
        timestamp: this.generateTimestamp(text),
        commonJobParams: {
          wasSpoken: false,
          transcribe_as: '',
          preserveFormatting: options.preserveFormatting === '1',
          formality: null,
        },
      },
    };

    console.log("DeepL: ", url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        'Referer': 'https://www.deepl.com/translator',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`DeepL experimental request failed: ${res.statusText}`);
    }

    const data = await res.json();

    const translatedText = data?.result?.translations?.[0]?.beams?.[0]?.postprocessed_sentence;

    return {
      text: translatedText || '',
      raw: data,
    };
  }

  private generateTimestamp(text: string): number {
    const baseTime = Date.now();
    const length = text.length;
    const minRandom = 100;
    const maxRandom = 1000;
    const randomOffset = Math.floor(Math.random() * (maxRandom - minRandom)) + minRandom;
    return baseTime - (baseTime % 1000) + randomOffset + length;
  }
}
