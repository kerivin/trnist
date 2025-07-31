import React, { useState } from 'react';
import { FaGoogle, FaMemory, FaYandex } from 'react-icons/fa';
import { SiDeepl } from 'react-icons/si';
import { Translators, TranslatorName, TranslatorOptions } from '../../shared/translator/translators';
import { TranslationResult } from 'src/shared/translator/translator';

export const TranslatorIcons: Record<TranslatorName, React.ReactNode> = {
  MyMemory: <svg width="18" height="18" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path id="svg_1" d="M30 4.234A25.766 25.766 0 1 1 4.234 30 25.795 25.795 0 0 1 30 4.234zM30 0a30 30 0 1 0 0 60 30 30 0 0 0 0-60z"/><path id="svg_2" d="m25.221 42.947.001-3.031H23.77c-1.8 0-2.431-1.074-2.431-2.748v-2.62c0-2.243-.916-3.948-3-4.643 2.084-.726 3-2.4 3-4.673v-2.59c0-1.674.631-2.747 2.431-2.747h1.453l.001-3.032H22.57c-3.126 0-5.273 1.863-5.273 5.242v3.885c0 1.357-.442 2.4-2.18 2.4H13.6v3.031l1.516.001c1.737.001 2.179 1.043 2.179 2.401v3.885c0 3.38 2.147 5.242 5.273 5.242h2.653z"/><path id="svg_3" d="M45.91 31.421v-3.03h-1.484c-1.737 0-2.21-1.011-2.21-2.4v-3.885c0-3.379-2.116-5.242-5.243-5.242H34.29v3.032h1.452c1.831 0 2.431 1.073 2.431 2.747v2.621c0 2.242.948 3.948 3 4.642-2.052.727-3 2.4-3 4.674v2.588c0 1.674-.6 2.748-2.431 2.748h-1.453v3.031h2.683c3.127 0 5.243-1.863 5.243-5.242v-3.884c0-1.357.473-2.399 2.21-2.399l1.484.001z"/>
            </svg>,
  Google: <FaGoogle size={16} />,
  Yandex: <FaYandex size={18} />,
  LibreTranslate: <FaYandex size={18} />,
  Apertium: <FaYandex size={18} />,
  DeepL: <SiDeepl size={18} />,
  Reverso: <FaYandex size={18} />,
};

const MachineTranslation: React.FC = () =>
{
  const [text, setText] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('ru');
  const [selectedServices, setSelectedServices] = useState<TranslatorName[]>([]);
  const [results, setResults] = useState<Record<TranslatorName, TranslationResult>>({} as Record<TranslatorName, TranslationResult>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (name: TranslatorName) =>
  {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleTranslate = async () =>
  {
    if (!text.trim() || selectedServices.length === 0) return;
    setLoading(true);
    setError('');
    const newResults: Record<TranslatorName, TranslationResult> = {} as Record<TranslatorName, TranslationResult>;

    for (const name of selectedServices) {
      try {
        const translator = Translators[name];
        const options = TranslatorOptions[name];
        const result = await translator.translate(text, from, to, options);
        newResults[name] = result;
      } catch (e: any) {
        newResults[name] = {
          text: '[Translation failed]',
          raw: e.message || e.toString(),
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div style={{
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '0.5rem',
    }}>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        {Object.keys(Translators).map((name) =>
        {
          const isActive = selectedServices.includes(name as TranslatorName);
          return (
            <div
              key={name}
              onClick={() => toggleService(name as TranslatorName)}
              style={{
                cursor: 'pointer',
                width: '1.7rem',
                height: '1.7rem',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: '0rem',
                borderColor: isActive ? 'orangered' : 'black',
                borderRadius: '50%',
                borderStyle: 'solid',
                color: isActive ? 'lightgray' : 'black',
                fill: isActive ? 'lightgray' : 'black',
                background: isActive ? 'orangered' : 'transparent',
              }}
              title={name}
            >
              {TranslatorIcons[name as TranslatorName] || name}
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <input
          style={styles.input}
          placeholder="From (e.g., en, auto)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="To (e.g., ru, es, zh)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <textarea
        rows={5}
        placeholder="Enter text to translate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}
      />

      <button
        onClick={handleTranslate}
        style={{
          padding: '10px',
          backgroundColor: '#2563eb',
          color: 'white',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        disabled={loading}
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {error && <p style={{
        color: 'red',
        marginTop: '1rem'
      }}>{error}</p>}

      <div style={{
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '1rem'
      }}>
        {selectedServices
          .slice()
          .reverse()
          .map((name) =>
          {
            const result = results[name];
            if (!result) return null;

            return (
              <div key={name} className="fade-in" style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}>
                <h3>{name.toUpperCase()}</h3>
                <p><strong>{result.text}</strong></p>
                {result.examples && result.examples.length > 0 && (
                  <ul>
                    {result.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  input: {
    maxWidth: '100px',
    display: 'flex',
    flexWrap: 'wrap',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    background: 'transparent',
  },
};

const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}`;
document.head.appendChild(styleTag);

export default MachineTranslation;
