import Translator, { TranslationResult } from '../translator';

export class ReversoOptions {
};

export default class ReversoTranslator implements Translator<ReversoOptions> {
    async translate(text: string, from: string, to: string, options: ReversoOptions = new ReversoOptions()): Promise<TranslationResult>
    {
        const reversoLangMap: Record<string, string> = {
            en: 'eng',
            fr: 'fra',
            de: 'ger',
            es: 'spa',
            it: 'ita',
            pt: 'por',
            ru: 'rus',
            zh: 'chi',
            ja: 'jpn',
            he: 'heb',
            pl: 'pol',
            ro: 'rum',
            uk: 'ukr',
            ar: 'ara',
            nl: 'dut',
            tr: 'tur',
        };

        const res = await fetch("https://api.reverso.net/translate/v1/translation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
            body: JSON.stringify({
                format: "text",
                from: reversoLangMap[from],
                to: reversoLangMap[to],
                input: text,
                options: {
                    contextResults: true,
                    languageDetection: true,
                    origin: "reversomobile",
                    sentenceSplitter: false,
                },
            }),
        });
        const data = await res.json();

        return {
            text: data.translation?.[0] || "",
            examples: data.context_results?.results?.map((r: any) => `${r.source_example} ⇨ ${r.target_example}`),
            raw: data,
        };
    }
}
