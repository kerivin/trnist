import { contextBridge } from 'electron';
import { Translators, TranslatorName, TranslatorOptions } from '../shared/translator/translators';

contextBridge.exposeInMainWorld('translatorAPI', {
  translate: async (
    service: TranslatorName,
    text: string,
    from: string,
    to: string
  ) => {
    const translator = Translators[service];
    const options = TranslatorOptions[service];
    return await translator.translate(text, from, to, options);
  },

  getAvailableTranslators: () => {
    return Object.keys(Translators);
  }
});
