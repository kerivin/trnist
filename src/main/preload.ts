import { contextBridge } from 'electron';
import GoogleTranslator from './lib/translator/google-translator';
import MyMemoryTranslator from './lib/translator/mymemory-translator';
import YandexTranslator from './lib/translator/yandex-translator';

const google = new GoogleTranslator();
const mymemory = new MyMemoryTranslator();
const yandex = new YandexTranslator();

contextBridge.exposeInMainWorld('translatorAPI', {
  google: google.translate.bind(google),
  mymemory: mymemory.translate.bind(mymemory),
  yandex: yandex.translate.bind(yandex),
});