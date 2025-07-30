import Translator from '../../../shared/translator';

export default class GoogleTranslator implements Translator {
  private async getTKK(): Promise<string> {
    const res = await fetch('https://translate.google.com');
    const html = await res.text();
    const m = html.match(/tkk:'(\d+\.\d+)'/);
    if (!m) throw new Error('TKK not found');
    return m[1];
  }

  private token(text: string, tkk: string): string {
    const b = Number(tkk.split('.')[0]) || 0;
    const _xr = (a: number, b2: string) => {
      for (let c = 0; c < b2.length - 2; c += 3) {
        const d = b2.charAt(c+2);
        const dNum = d >= 'a' ? d.charCodeAt(0) - 87 : Number(d);
        const op = b2.charAt(c+1)==='+' ? (a >>> dNum):(a << dNum);
        a = b2.charAt(c)==='+' ? ( (a + op)&0xFFFFFFFF ) : (a ^ op);
      }
      return a;
    };
    let a = b;
    for (const ch of text) {
      a += ch.charCodeAt(0);
      a = _xr(a, '+-a^+6');
    }
    a = _xr(a, '+-3^+b+-f');
    a ^= Number(tkk.split('.')[1])||0;
    if (a < 0) a = (a & 0x7FFFFFFF) + 0x80000000;
    a %= 1e6;
    return `${a}.${a ^ b}`;
  }
  
  async translate(text: string, from = 'auto', to = 'en'): Promise<string> {
    const tkk = await this.getTKK();
    const tk = this.token(text, tkk);
    const url =
      `https://translate.google.com/translate_a/single?client=webapp&sl=${from}&tl=${to}&dt=t&tk=${tk}&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    const data = await resp.json() as any;
    return data[0].map((d: any) => d[0]).join('');
  }
}