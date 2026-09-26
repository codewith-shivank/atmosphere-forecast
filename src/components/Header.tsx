import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LocateFixed, Moon, RefreshCw, Search, Star, Sun, SunMoon, X } from 'lucide-react';
import { searchCities } from '../services/weatherApi';
import { Location, Unit } from '../types/weather';

interface HeaderProps {
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  onSelectLocation: (location: Location) => void;
  onDetectLocation: () => void;
  onRefresh: () => void;
  loading: boolean;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

const POPULAR_CITIES: Location[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

const STORAGE_KEYS = {
  RECENT: 'atmosphere_recent_searches',
  FAVORITES: 'atmosphere_favorites',
} as const;

const MAX_RECENT = 5;
const MAX_FAVORITES = 10;

function getStoredLocations(key: string): Location[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function saveLocations(key: string, locations: Location[]) {
  try {
    localStorage.setItem(key, JSON.stringify(locations.slice(0, key === STORAGE_KEYS.RECENT ? MAX_RECENT : MAX_FAVORITES)));
  } catch {
    // ignore
  }
}

function locationKey(loc: Location): string {
  return `${loc.name}|${loc.latitude}|${loc.longitude}`;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onUnitChange,
  onSelectLocation,
  onDetectLocation,
  onRefresh,
  loading,
  theme,
  onThemeChange,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<Location[]>(() => getStoredLocations(STORAGE_KEYS.RECENT));
  const [favorites, setFavorites] = useState<Location[]>(() => getStoredLocations(STORAGE_KEYS.FAVORITES));

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search autocomplete: debounced fetch with abort on rapid typing
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const locations = await searchCities(trimmed, controller.signal);
        if (!cancelled) {
          setResults(locations);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);


  const addToRecent = useCallback((loc: Location) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(l => locationKey(l) !== locationKey(loc));
      const updated = [loc, ...filtered].slice(0, MAX_RECENT);
      saveLocations(STORAGE_KEYS.RECENT, updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((loc: Location) => {
    setFavorites(prev => {
      const isFav = prev.some(l => locationKey(l) === locationKey(loc));
      let updated: Location[];
      if (isFav) {
        updated = prev.filter(l => locationKey(l) !== locationKey(loc));
      } else {
        updated = [loc, ...prev].slice(0, MAX_FAVORITES);
      }
      saveLocations(STORAGE_KEYS.FAVORITES, updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback((loc: Location) => {
    return favorites.some(f => locationKey(f) === locationKey(loc));
  }, [favorites]);

  const handleSelect = useCallback((loc: Location) => {
    onSelectLocation(loc);
    addToRecent(loc);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelectLocation, addToRecent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = query.trim().length < 2 ? POPULAR_CITIES : results;
    if (!isOpen || list.length === 0) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(list[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen, results, highlightedIndex, query, handleSelect]);

  const list = query.trim().length < 2 ? POPULAR_CITIES : results;

  // Render a single location option
  const renderLocationOption = (loc: Location, idx: number, isSelected: boolean, showFav: boolean = true) => {
    const regionDetails = [loc.admin1, loc.country].filter(Boolean).join(', ');
    const fav = isFavorite(loc);

    return (
      <div key={`${loc.name}-${loc.latitude}-${loc.longitude}-${idx}`} className="flex items-center justify-between w-full">
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          onClick={() => handleSelect(loc)}
          onMouseEnter={() => setHighlightedIndex(idx)}
          className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
            isSelected
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
          }`}
        >
          <span className="font-medium text-zinc-900 truncate dark:text-zinc-100">{loc.name}</span>
          {regionDetails && (
            <span className="text-xs text-zinc-400 shrink-0 ml-2 truncate max-w-[50%] dark:text-zinc-500">
              {regionDetails}
            </span>
          )}
        </button>
        {showFav && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(loc);
            }}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1 rounded-md transition-colors shrink-0 ${
              fav
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  // Render a section header
  const renderSectionHeader = (title: string, action?: React.ReactNode) => (
    <div className="flex items-center justify-between px-3.5 py-1.5">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
        {title}
      </span>
      {action}
    </div>
  );

  return (
    <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-30 dark:bg-zinc-950/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm dark:bg-white dark:text-zinc-900">
            At
          </div>
          <span className="font-semibold text-zinc-900 text-base tracking-tight hidden sm:inline dark:text-zinc-100">
            Atmosphere
          </span>
        </div>

        {/* Search Bar */}
        <div ref={containerRef} className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search city, region, or country..."
              aria-label="Search for a city"
              aria-autocomplete="list"
              aria-controls="autocomplete-listbox"
              aria-expanded={isOpen && list.length > 0}
              aria-haspopup="listbox"
              className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-100/80 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg border border-transparent focus:border-zinc-300 dark:focus:border-zinc-600 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-md"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div
              id="autocomplete-listbox"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100 max-h-96 overflow-y-auto"
            >
              {query.trim().length >= 2 ? (
                <div>
                  {searching && (
                    <div className="px-3.5 py-2 text-xs text-zinc-400">Searching locations...</div>
                  )}
                  {!searching && results.length === 0 && (
                    <div className="px-3.5 py-3 text-xs text-zinc-500 text-center dark:text-zinc-400">
                      No locations found for &ldquo;{query}&rdquo;
                    </div>
                  )}
                  {results.map((loc, idx) => {
                    const isSelected = idx === highlightedIndex;
                    return renderLocationOption(loc, idx, isSelected, true);
                  })}
                </div>
              ) : (
                <div>
                  {/* Favorites Section */}
                  {favorites.length > 0 && (
                    <div>
                      {renderSectionHeader('Favorites', (
                        <button
                          type="button"
                          onClick={() => {
                            setFavorites([]);
                            saveLocations(STORAGE_KEYS.FAVORITES, []);
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                          aria-label="Clear all favorites"
                        >
                          Clear
                        </button>
                      ))}
                      {favorites.map((loc, idx) => {
                        const isSelected = idx === highlightedIndex;
                        return renderLocationOption(loc, idx, isSelected, true);
                      })}
                    </div>
                  )}

                  {/* Recent Searches Section */}
                  {recentSearches.length > 0 && (
                    <div>
                      {renderSectionHeader('Recent Searches', (
                        <button
                          type="button"
                          onClick={() => {
                            setRecentSearches([]);
                            saveLocations(STORAGE_KEYS.RECENT, []);
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                          aria-label="Clear recent searches"
                        >
                          Clear
                        </button>
                      ))}
                      {recentSearches.map((loc, idx) => {
                        const isSelected = idx === highlightedIndex;
                        return renderLocationOption(loc, idx, isSelected, false);
                      })}
                    </div>
                  )}

                  {/* Popular Cities Section */}
                  {favorites.length === 0 && recentSearches.length === 0 && (
                    <div>
                      <div className="px-3.5 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                        Popular Cities
                      </div>
                      {POPULAR_CITIES.map((loc, idx) => {
                        const isSelected = idx === highlightedIndex;
                        return renderLocationOption(loc, idx, isSelected, true);
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions: Theme, Location, Refresh, Unit Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Toggle */}
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => {
                const next: Record<string, 'light' | 'dark' | 'system'> = {
                  light: 'dark',
                  dark: 'system',
                  system: 'light',
                };
                onThemeChange(next[theme]);
              }}
              title={`Current theme: ${theme}. Click to cycle.`}
              aria-label={`Switch theme, current: ${theme}`}
              className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              {theme === 'system' && <SunMoon className="w-4 h-4" />}
            </button>
          </div>

          {/* Detect my location */}
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={loading}
            title="Use my current location"
            aria-label="Detect my current location"
            className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {/* Refresh forecast */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh forecast"
            aria-label="Refresh forecast"
            className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Unit Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 ml-1">
            <button
              type="button"
              onClick={() => onUnitChange('celsius')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === 'celsius'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onUnitChange('fahrenheit')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === 'fahrenheit'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};