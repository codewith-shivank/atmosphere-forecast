import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-100 dark:border-rose-900/40 p-8 text-center max-w-lg mx-auto shadow-xs dark:shadow-none"
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Unable to load forecast
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs focus-ring"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
