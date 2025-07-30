import Translator, { TranslationResult } from '../translator';

declare global {
  interface Window {
    electron: {
      cookies: {
        getCookies(domain: string): Promise<string>;
      };
    };
  }
}


export class YandexOptions {
  apiKey?: string;
}

export default class YandexTranslator implements Translator<YandexOptions> {
  async translate(text: string, from: string, to: string, options: YandexOptions = new YandexOptions()): Promise<TranslationResult> {
    if (options.apiKey) {
      return this.translateOfficialAPI(text, from, to, options.apiKey);
    } else {
      return this.translateExperimental(text, from, to);
    }
  }

  private async translateOfficialAPI(text: string, from: string, to: string, apiKey: string): Promise<TranslationResult> {
    const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&lang=${from}-${to}&text=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      text: data.text.join(' '),
      raw: data
    };
  }

  private async translateExperimental(text: string, from: string, to: string): Promise<TranslationResult> {
    const homepageUrl = 'https://translate.yandex.com/';
    const userAgent = navigator.userAgent;

    await new Promise<void>((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = homepageUrl;
      iframe.onload = () => {
        console.log('[Yandex] iframe loaded');
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 1000); // wait for JS cookie setting
      };
      document.body.appendChild(iframe);
    });

    const homepageRes = await fetch(homepageUrl, {
      credentials: 'include',
      headers: {
        'User-Agent': userAgent,
      },
    });

    const html = await homepageRes.text();

    const sidMatch = html.match(/SID["']?\s*[:=]\s*["']([^"'\\]+)/i);
    if (!sidMatch) throw new Error('Yandex SID not found');
    const sid = sidMatch[1];

    const yu = document.cookie.match(/yu=([^;]+)/)?.[1];
    if (!yu) throw new Error('Yandex yu cookie still not found after iframe trick');

    const id = `${sid}-1-0`;
    const url =
      `https://translate.yandex.net/api/v1/tr.json/translate` +
      `?id=${id}&srv=tr-text&source_lang=${from}&target_lang=${to}` +
      `&reason=auto&format=text&strategy=0&disable_cache=false&ajax=1&yu=${yu}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Retpath-Y': homepageUrl,
        'Origin': homepageUrl,
        'Referer': homepageUrl,
        'User-Agent': userAgent,
      },
      body: new URLSearchParams({
        text,
        options: '4',
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Yandex unofficial API responded with ${res.status}`);
    }

    const json = await res.json();
    if (!json?.text || !Array.isArray(json.text)) {
      throw new Error('Malformed Yandex response');
    }

    return {
      text: json.text.join(' '),
      raw: json,
    };
  }
}