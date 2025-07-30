import React, { useState, useEffect } from 'react';
import Translator from '../../shared/translator';

export type Service = 'google' | 'mymemory' | 'yandex';

declare global {
  interface Window {
    translatorAPI: Record<Service, Translator['translate']>;
  }
}

const MachineTranslation: React.FC = () => {
  const [text, setText] = useState('');
  const [from, setFrom] = useState('auto');
  const [to, setTo] = useState('en');
  const [service, setService] = useState<Service>('google');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const translation = await window.translatorAPI[service](text, from, to);
      setResult(translation);
    } catch (e: any) {
      setError('Translation failed: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('💡 Is translatorAPI defined?', !!window.translatorAPI);
    if (!window.translatorAPI) {
      alert('translatorAPI is undefined — check preload');
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Multiservice Translator</h1>

      <textarea
        rows={5}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter text to translate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2 mb-2">
        <input
          className="w-1/2 p-2 border rounded"
          placeholder="From language (e.g., auto, en, zh)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className="w-1/2 p-2 border rounded"
          placeholder="To language (e.g., en, es, de)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <select
        className="w-full p-2 border rounded mb-2"
        value={service}
        onChange={(e) => setService(e.target.value as Service)}
      >
        <option value="google">Google</option>
        <option value="mymemory">MyMemory</option>
        <option value="yandex">Yandex</option>
      </select>

      <button
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-1">Translation:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default MachineTranslation;
