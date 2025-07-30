import Translator from './translator';
import GoogleTranslator, { GoogleOptions } from './impl/google-translator';
import MyMemoryTranslator, { MyMemoryOptions } from './impl/mymemory-translator';
import YandexTranslator, { YandexOptions } from './impl/yandex-translator';
import LibreTranslateTranslator, { LibreTranslateOptions } from './impl/libretranslate-translator';
import ApertiumTranslator, { ApertiumOptions } from './impl/apertium-translator';
import DeepLTranslator, { DeepLOptions } from './impl/deepl-translator';
import ReversoTranslator, { ReversoOptions } from './impl/reverso-translator';

export type TranslatorName =
    'mymemory'
  | 'google'
  | 'yandex'
  | 'libretranslate'
  | 'apertium'
  | 'deepl'
  | 'reverso';

interface TranslatorOptionsMap {
  mymemory: MyMemoryOptions;
  google: GoogleOptions;
  yandex: YandexOptions;
  libretranslate: LibreTranslateOptions;
  apertium: ApertiumOptions;
  deepl: DeepLOptions;
  reverso: ReversoOptions;
}

export const TranslatorOptions: Record<TranslatorName, TranslatorOptionsMap[TranslatorName]> = {
  mymemory: new MyMemoryOptions(),
  google: new GoogleOptions(),
  yandex: new YandexOptions(),
  libretranslate: new LibreTranslateOptions(),
  apertium: new ApertiumOptions(),
  deepl: new DeepLOptions(),
  reverso: new ReversoOptions(),
};

export const Translators : Record<TranslatorName, Translator<TranslatorOptionsMap[TranslatorName]>> = {
  mymemory: new MyMemoryTranslator(),
  google: new GoogleTranslator(),
  yandex: new YandexTranslator(),
  libretranslate: new LibreTranslateTranslator(),
  apertium: new ApertiumTranslator(),
  deepl: new DeepLTranslator(),
  reverso: new ReversoTranslator(),
};