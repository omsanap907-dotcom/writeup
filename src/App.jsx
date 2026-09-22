import React, { useMemo, useState } from 'react';
import './App.css';

const DEFAULT_LIMIT = 3000;

function splitIntoChunks(text, limit) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = [];
  let count = 0;

  const flush = () => {
    if (current.length) {
      chunks.push(current.join('\n\n').trim());
      current = [];
      count = 0;
    }
  };

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    if (words.length <= limit - count) {
      current.push(paragraph);
      count += words.length;
      continue;
    }

    flush();

    if (words.length <= limit) {
      current = [paragraph];
      count = words.length;
      continue;
    }

    let start = 0;
    while (start < words.length) {
      const piece = words.slice(start, start + limit);
      chunks.push(piece.join(' '));
      start += limit;
    }
  }

  flush();
  return chunks;
}

function wordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function App() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [copied, setCopied] = useState(null);
  const chunks = useMemo(() => splitIntoChunks(text, Math.max(1, Number(limit) || DEFAULT_LIMIT)), [text, limit]);
  const total = wordCount(text);

  const copyChunk = async (chunk, index) => {
    try {
      await navigator.clipboard.writeText(chunk);
      setCopied(index);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(chunks.join('\n\n'));
      setCopied('all');
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([chunks.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writeup-chunks.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setText('');
    setCopied(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">WriteUp <span>Chunker</span></div>
          <div className="tagline">Split long text into copy-ready word limits</div>
        </div>
        <button className="ghost" onClick={clear}>Clear</button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">COPY & SPLIT</div>
          <h1>Paste your document text. Get 3,000-word copies.</h1>
          <p>
            This tool only splits your text. It does not paraphrase, rewrite, summarize, or change the wording.
            Paragraphs are kept together when possible.
          </p>
        </section>

        <section className="panel input-panel">
          <div className="panel-head">
            <div>
              <h2>Source text</h2>
              <span>Paste the full document text below.</span>
            </div>
            <div className="controls">
              <label>
                Words per copy
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                />
              </label>
              <span className="count">{total.toLocaleString()} words</span>
            </div>
          </div>
          <textarea
            className="source"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your entire document here..."
            spellCheck="false"
          />
          <div className="input-footer">
            <span>Target: {Number(limit || DEFAULT_LIMIT).toLocaleString()} words per copy</span>
            <button className="primary" onClick={() => setText(text)}>Split Text</button>
          </div>
        </section>

        <section className="summary">
          <div><b>{chunks.length}</b><span>Copies</span></div>
          <div><b>{total.toLocaleString()}</b><span>Total words</span></div>
          <div><b>{chunks.length ? Math.ceil(total / chunks.length).toLocaleString() : 0}</b><span>Avg. words</span></div>
        </section>

        {chunks.length > 0 ? (
          <section className="results">
            <div className="results-head">
              <div>
                <h2>Copy-ready sections</h2>
                <span>Each section can be copied separately.</span>
              </div>
              <div className="result-actions">
                <button className="secondary" onClick={downloadTxt}>Download TXT</button>
                <button className="secondary" onClick={copyAll}>{copied === 'all' ? 'Copied' : 'Copy All'}</button>
              </div>
            </div>

            <div className="chunk-list">
              {chunks.map((chunk, index) => (
                <article className="chunk" key={index}>
                  <div className="chunk-head">
                    <div>
                      <strong>Copy {index + 1}</strong>
                      <span>{wordCount(chunk).toLocaleString()} words</span>
                    </div>
                    <button className="copy" onClick={() => copyChunk(chunk, index)}>
                      {copied === index ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <textarea className="chunk-text" value={chunk} readOnly spellCheck="false" />
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="empty">
            <div className="empty-icon">↘</div>
            <h2>Your copies will appear here</h2>
            <p>Paste your document above to split it into separate chunks.</p>
          </section>
        )}
      </main>
    </div>
  );
}
