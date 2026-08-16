import { useMemo, useState, useDeferredValue, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { glossary, getModule } from '@/data/modules';
import type { GlossaryTerm, Localized } from '@/types/exercise';

/**
 * The shared vocabulary, and the one page in the app that crosses tracks.
 *
 * Every term names the module that teaches it, so a React reader who meets
 * "closure" can get to the JavaScript chapter that explains it — the gap
 * ANALYSIS §6 described as "the JS track defines closures; the React track
 * uses them without linking back".
 *
 * Terms are sorted in the active language, which is why the list order differs
 * between locales. That is correct: a French reader looking for "Fermeture"
 * should not have to know it is filed under C.
 */

/** Fall back to English for an untranslated locale, exactly like a chapter. */
function localized(text: Localized, lang: string): string {
  return text[lang] ?? text.en;
}

const TRACK_TONE: Record<string, string> = {
  react: 'text-sky-700 dark:text-sky-400',
  'react-native': 'text-violet-700 dark:text-violet-400',
  javascript: 'text-amber-700 dark:text-amber-400',
};

function TermCard({ term, lang }: { term: GlossaryTerm; lang: string }) {
  const { t } = useTranslation();
  const home = getModule(term.definedIn);

  return (
    <article
      id={term.id}
      className="scroll-mt-24 border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900/50"
    >
      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {localized(term.term, lang)}
        </h2>
        {home && (
          <Link
            to={`/module/${home.id}`}
            className={`text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${
              TRACK_TONE[home.track] ?? 'text-gray-500'
            }`}
          >
            {t('glossary.definedIn', { module: t(`modules.${home.id}.name`) })}
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {localized(term.definition, lang)}
      </p>

      {term.seeAlso?.length ? (
        <p className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">{t('glossary.seeAlso')}</span>
          {term.seeAlso.map((id) => {
            const other = glossary.find((x) => x.id === id);
            if (!other) return null;
            return (
              <a
                key={id}
                href={`#${id}`}
                className="text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {localized(other.term, lang)}
              </a>
            );
          })}
        </p>
      ) : null}
    </article>
  );
}

export function GlossaryView() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);

  // A module's "Defines" chip links to /glossary#memoization. The browser only
  // honours a fragment on a real document load — this route arrives via the
  // router, so the list does not exist yet when that would have happened, and
  // the reader lands at the top of twenty-two cards instead of on their term.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash, lang]);

  const visible = useMemo(() => {
    const sorted = [...glossary].sort((a, b) =>
      localized(a.term, lang).localeCompare(localized(b.term, lang), lang)
    );
    const q = deferred.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (x) =>
        localized(x.term, lang).toLowerCase().includes(q) ||
        localized(x.definition, lang).toLowerCase().includes(q)
    );
  }, [deferred, lang]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl text-gray-900 dark:text-white mb-1">
        {t('glossary.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('glossary.intro')}</p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('glossary.search')}
        aria-label={t('glossary.search')}
        className="w-full mb-2 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      />
      <p role="status" className="text-xs text-gray-400 dark:text-gray-500 mb-6">
        {t('glossary.count', { count: visible.length })}
      </p>

      <div className="space-y-3">
        {visible.map((term) => (
          <TermCard key={term.id} term={term} lang={lang} />
        ))}
      </div>
    </div>
  );
}
