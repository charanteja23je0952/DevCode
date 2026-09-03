import { useEffect, useMemo, useRef, useState } from 'react';
import { highlightMatch } from './utils/highlightMatch';

const ITEMS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'Node.js',
  'Express',
  'Next.js',
  'Vite',
  'Webpack',
  'Tailwind CSS',
  'PostgreSQL',
  'MongoDB',
  'Redis'
];

const DEBOUNCE_MS = 250;

function HighlightedText({ text, query }) {
  const segments = highlightMatch(text, query);

  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={`${segment.text}-${index}`}>{segment.text}</mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        )
      )}
    </>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];

    const normalized = debouncedQuery.toLowerCase();

    return ITEMS.filter((item) => item.toLowerCase().includes(normalized));
  }, [debouncedQuery]);

  useEffect(() => {
    setActiveIndex(results.length ? 0 : -1);
  }, [debouncedQuery, results.length]);

  const chooseResult = (value) => {
    setQuery(value);
    setDebouncedQuery(value);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1
      );
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseResult(results[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setActiveIndex(-1);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Developer Tools</p>
        <h1>Find a technology</h1>
        <p className="description">
          Search the catalog. Suggestions update as you type, matching text is
          highlighted, and the result list supports keyboard navigation.
        </p>

        <div className="search-area">
          <label htmlFor="technology-search">Search</label>
          <input
            ref={inputRef}
            id="technology-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try typing react or script"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
          />

          {query.trim() && (
            <div className="status" aria-live="polite">
              {results.length
                ? `${results.length} suggestion${results.length === 1 ? '' : 's'}`
                : 'No matches'}
            </div>
          )}

          {results.length > 0 && (
            <ul id="suggestions" className="results" role="listbox">
              {results.map((item, index) => (
                <li
                  key={item}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? 'active' : ''}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    chooseResult(item);
                    inputRef.current?.focus();
                  }}
                >
                  <HighlightedText text={item} query={debouncedQuery} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tips">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </section>
    </main>
  );
}
