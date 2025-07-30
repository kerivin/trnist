import React, { useState } from 'react';
import { Translators, TranslatorName, TranslatorOptions } from '../../shared/translator/translators';
import { TranslationResult } from 'src/shared/translator/translator';

const MachineTranslation: React.FC = () => {
  const [text, setText] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('ru');
  const [service, setService] = useState<TranslatorName>('mymemory');
  const [result, setResult] = useState<TranslationResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    try {
      const translator = Translators[service];
      const options = TranslatorOptions[service];
      const response = await translator.translate(text, from, to, options);
      // const response = await window.translatorAPI.translate(service, text, from, to);
      setResult(response);
    } catch (e: any) {
      setError('Translation failed: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <textarea
        rows={5}
        placeholder="Enter text to translate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.textarea}
      />

      <div style={styles.row}>
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

      <div style={styles.buttonRow}>
        {Object.keys(Translators).map((name) => {
          const isActive = service === name;
          return (
            <button
              key={name}
              onClick={() => setService(name as TranslatorName)}
              style={{
                ...styles.selectorButton,
                backgroundColor: isActive ? '#2563eb' : '#f1f1f1',
                color: isActive ? '#fff' : '#000',
                border: isActive ? '2px solid #2563eb' : '1px solid #ccc',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleTranslate}
        style={styles.translateButton}
        disabled={loading}
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <h3>Translation:</h3>
          <p>{result.text}</p>
          <h3>Raw:</h3>
          <p>{JSON.stringify(result.raw, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    fontFamily: 'sans-serif',
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  textarea: {
    width: '90%',
    padding: '10px',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  selectorButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    minWidth: '80px',
    textAlign: 'center',
  },
  translateButton: {
    width: '90%',
    padding: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
  },
  resultBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
  },
};

export default MachineTranslation;