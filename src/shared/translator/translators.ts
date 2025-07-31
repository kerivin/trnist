import Translator from './translator';
import GoogleTranslator, { GoogleOptions } from './impl/google-translator';
import MyMemoryTranslator, { MyMemoryOptions } from './impl/mymemory-translator';
import YandexTranslator, { YandexOptions } from './impl/yandex-translator';
import LibreTranslateTranslator, { LibreTranslateOptions } from './impl/libretranslate-translator';
import ApertiumTranslator, { ApertiumOptions } from './impl/apertium-translator';
import DeepLTranslator, { DeepLOptions } from './impl/deepl-translator';
import ReversoTranslator, { ReversoOptions } from './impl/reverso-translator';

export type TranslatorName =
    'MyMemory'
  | 'Google'
  | 'Yandex'
  | 'LibreTranslate'
  | 'Apertium'
  | 'DeepL'
  | 'Reverso';

interface TranslatorOptionsMap {
  MyMemory: MyMemoryOptions;
  Google: GoogleOptions;
  Yandex: YandexOptions;
  LibreTranslate: LibreTranslateOptions;
  Apertium: ApertiumOptions;
  DeepL: DeepLOptions;
  Reverso: ReversoOptions;
}

export const TranslatorOptions: Record<TranslatorName, TranslatorOptionsMap[TranslatorName]> = {
  MyMemory: new MyMemoryOptions(),
  Google: new GoogleOptions(),
  Yandex: new YandexOptions(),
  LibreTranslate: new LibreTranslateOptions(),
  Apertium: new ApertiumOptions(),
  DeepL: new DeepLOptions(),
  Reverso: new ReversoOptions(),
};

export const Translators : Record<TranslatorName, Translator<TranslatorOptionsMap[TranslatorName]>> = {
  MyMemory: new MyMemoryTranslator(),
  Google: new GoogleTranslator(),
  Yandex: new YandexTranslator(),
  LibreTranslate: new LibreTranslateTranslator(),
  Apertium: new ApertiumTranslator(),
  DeepL: new DeepLTranslator(),
  Reverso: new ReversoTranslator(),
};