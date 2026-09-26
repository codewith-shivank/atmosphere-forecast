import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CurrentWeather } from './components/CurrentWeather';
import { DailyForecast } from './components/DailyForecast';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { HourlyForecast } from './components/HourlyForecast';
import { WeatherSkeleton } from './components/WeatherSkeleton';
import { useWeather } from './hooks/useWeather';
import { Location } from './types/weather';

type Theme = 'light' | 'dark' | 'system';

export default function App() {
  const {
    weather,
    loading,
    error,
    unit,
    setUnit,
    selectLocation,
    detectLocation,
    refresh,
  } = useWeather();

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('atmosphere_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // ignore storage errors in restricted environments
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      if (theme === 'light') {
        root.classList.remove('dark');
      } else if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        // system: follow OS preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Update when OS preference changes (only relevant in system mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleOsChange = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleOsChange);

    try {
      localStorage.setItem('atmosphere_theme', theme);
    } catch {
      // ignore
    }

    return () => mediaQuery.removeEventListener('change', handleOsChange);
  }, [theme]);

  const handleLocationSelect = useCallback((loc: Location) => {
    selectLocation(loc);
  }, [selectLocation]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <Header
        unit={unit}
        onUnitChange={setUnit}
        onSelectLocation={handleLocationSelect}
        onDetectLocation={detectLocation}
        onRefresh={refresh}
        loading={loading}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading && !weather && <WeatherSkeleton />}

        {error && !weather && (
          <div className="py-12">
            <ErrorMessage message={error} onRetry={refresh} />
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            {error && (
              <div
                role="alert"
                className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between dark:bg-amber-900/20 dark:border-amber-700/60 dark:text-amber-300"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="font-medium underline hover:text-amber-950 dark:hover:text-amber-100 ml-2 shrink-0 focus-ring rounded"
                >
                  Retry
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${weather.location.latitude.toFixed(2)}-${weather.location.longitude.toFixed(2)}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <CurrentWeather
                  current={weather.current}
                  location={weather.location}
                  unit={unit}
                  updatedAt={weather.updatedAt}
                />

                <HourlyForecast items={weather.hourly} unit={unit} />

                <DailyForecast items={weather.daily} unit={unit} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-zinc-200/80 bg-white py-5 mt-auto dark:bg-zinc-950 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Atmosphere Weather</span>
            <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
            <span>Made with ♥ by{' '}
              <a
                href="https://github.com/codewithshivank"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                CodeWithShivank
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Powered by{' '}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline-offset-2 hover:underline"
                aria-label="Open-Meteo weather API"
              >
                Open-Meteo
              </a>
            </span>
            <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
            <a
              href="https://github.com/codewithshivank/atmosphere-weather"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="View source on GitHub"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}