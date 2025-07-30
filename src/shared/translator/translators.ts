
import Translator from './translator';
import GoogleTranslator from './google-translator';
import MyMemoryTranslator from './mymemory-translator';
import YandexTranslator from './yandex-translator';

export type TranslatorName = 'google' | 'mymemory' | 'yandex';

const Translators = {
  google: new GoogleTranslator(),
  mymemory: new MyMemoryTranslator(),
  yandex: new YandexTranslator(),
} satisfies Record<TranslatorName, Translator>;

export default Translators;