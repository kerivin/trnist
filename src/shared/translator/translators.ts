
import Translator from './translator';
import GoogleTranslator, { GoogleOptions } from './implementations/google-translator';
import MyMemoryTranslator, { MyMemoryOptions } from './implementations/mymemory-translator';
import YandexTranslator, { YandexOptions } from './implementations/yandex-translator';

export type TranslatorName = 'google' | 'mymemory' | 'yandex';

interface TranslatorOptionsMap {
  google: GoogleOptions;
  mymemory: MyMemoryOptions;
  yandex: YandexOptions;
}

export const TranslatorOptions: Record<TranslatorName, TranslatorOptionsMap[TranslatorName]> = {
  google: new GoogleOptions(),
  mymemory: new MyMemoryOptions(),
  yandex: new YandexOptions(),
};

export const Translators : Record<TranslatorName, Translator<TranslatorOptionsMap[TranslatorName]>> = {
  google: new GoogleTranslator(),
  mymemory: new MyMemoryTranslator(),
  yandex: new YandexTranslator(),
};