import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Replaces react-router's default error screen (a raw stack trace on an
 * unstyled page) for both thrown render errors and unmatched URLs.
 */
export function RouteError() {
  const { t } = useTranslation();
  const error = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const detail =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : null;

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
        {isNotFound ? '404' : t('errors.somethingWentWrong')}
      </p>
      <h1 className="font-display text-3xl text-gray-900 dark:text-white mb-3">
        {isNotFound ? t('errors.pageNotFoundTitle') : t('errors.unexpectedTitle')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {isNotFound ? t('errors.pageNotFoundBody') : t('errors.unexpectedBody')}
      </p>

      {!isNotFound && detail && (
        <pre className="text-left text-xs font-mono text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 mb-8 overflow-x-auto whitespace-pre-wrap">
          {detail}
        </pre>
      )}

      <Link
        to="/"
        className="inline-block px-5 py-2 bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
      >
        {t('nav.home')}
      </Link>
    </div>
  );
}
