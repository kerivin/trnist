import Translator, { TranslationResult } from '../translator';

export class DeepLOptions {
  apiKey!: string;
  splitSentences: string = '1';
  preserveFormatting: string = '0';
}

export default class DeepLTranslator implements Translator<DeepLOptions> {
  async translate(text: string, from: string, to: string, options: DeepLOptions = new DeepLOptions()): Promise<TranslationResult>
  {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `DeepL-Auth-Key ${options.apiKey}`,
    },
    body: new URLSearchParams({
        text,
        source_lang: from.toUpperCase(),
        target_lang: to.toUpperCase(),
        split_sentences: options.splitSentences,
        preserve_formatting: options.preserveFormatting,
    }),
    });

    const data = await res.json();
    return {
      text: data?.translations?.[0]?.text || '',
      raw: data,
    };
  }
}
