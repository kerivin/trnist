import Translator, { TranslationResult } from "../translator";

export class MicrosoftOptions {
  apiKey!: string;
  region!: string;
  endpoint: string = "https://api.cognitive.microsofttranslator.com";
}

export default class MicrosoftTranslator implements Translator<MicrosoftOptions> {
  async translate(text: string, from: string, to: string, options: MicrosoftOptions): Promise<TranslationResult>
  {
    if (!options.apiKey || !options.region) {
      throw new Error("Microsoft Translator requires both apiKey and region.");
    }

    const url = `${options.endpoint}/translate?api-version=3.0&from=${from}&to=${to}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": options.apiKey,
        "Ocp-Apim-Subscription-Region": options.region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: text }]),
    });

    const data = await res.json();
    const translatedText = data?.[0]?.translations?.[0]?.text ?? "";
    const confidence = data?.[0]?.detectedLanguage?.score;

    return {
      text: translatedText,
      confidence,
      raw: data,
    };
  }
}
