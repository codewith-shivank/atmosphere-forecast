import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Check, Droplets, Gauge, Search, Sparkles, Sun, Thermometer, Wind, X } from 'lucide-react';
import { fetchAirQuality, fetchWeatherData, searchCities } from '../services/weatherApi';
import { Location, Unit, WeatherData } from '../types/weather';
import { convertTemp, formatPressure, formatTemp, formatVisibility, formatWind } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseLocation: Location;
  baseWeather: WeatherData | null;
  unit: Unit;
  onSelectCity?: (location: Location) => void;
}

const COMPARISON_PRESETS: Location[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  baseLocation,
  baseWeather,
  unit,
}) => {
  const [targetLocation, setTargetLocation] = useState<Location>(COMPARISON_PRESETS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TanStack Query for Target Location Weather
  const targetWeatherQuery = useQuery({
    queryKey: ['weather', targetLocation.latitude.toFixed(4), targetLocation.longitude.toFixed(4)],
    queryFn: () => fetchWeatherData(targetLocation),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // TanStack Query for Target Location AQI
  const targetAqiQuery = useQuery({
    queryKey: ['airQuality', targetLocation.latitude.toFixed(4), targetLocation.longitude.toFixed(4)],
    queryFn: () => fetchAirQuality(targetLocation.latitude, targetLocation.longitude),
    enabled: isOpen,
    staleTime: 10 * 60 * 1000,
  });

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const targetWeather = targetWeatherQuery.data;
  const targetAqi = targetAqiQuery.data;

  // Compute differences
  const tempDiff =
    baseWeather && targetWeather
      ? convertTemp(targetWeather.current.temp, unit) - convertTemp(baseWeather.current.temp, unit)
      : 0;

  const humidityDiff =
    baseWeather && targetWeather
      ? targetWeather.current.humidity - baseWeather.current.humidity
      : 0;

  const windDiff =
    baseWeather && targetWeather
      ? targetWeather.current.windSpeed - baseWeather.current.windSpeed
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Multi-City Weather Comparison
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Side-by-side atmospheric & meteorological analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Target City Selector & Quick Presets */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Compare <span className="text-indigo-600 dark:text-indigo-400 font-bold">{baseLocation.name}</span> with:
            </label>

            {/* Quick chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {COMPARISON_PRESETS.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => setTargetLocation(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    targetLocation.name === city.name
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Or search any custom city to compare..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Search results dropdown if any */}
            {searchResults.length > 0 && (
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                {searchResults.map((loc) => (
                  <button
                    key={`${loc.name}-${loc.latitude}`}
                    type="button"
                    onClick={() => {
                      setTargetLocation(loc);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-between text-zinc-800 dark:text-zinc-200"
                  >
                    <span>
                      {loc.name}, {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                    </span>
                    <span className="text-[10px] text-zinc-400">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City 1 Card (Base) */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Primary Location</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {baseLocation.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{baseLocation.country}</p>
                </div>
                {baseWeather && (
                  <WeatherIcon
                    code={baseWeather.current.conditionCode}
                    isDay={baseWeather.current.isDay}
                    className="w-12 h-12"
                  />
                )}
              </div>

              {baseWeather ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatTemp(baseWeather.current.temp, unit)}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Feels like {formatTemp(baseWeather.current.feelsLike, unit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Condition</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{baseWeather.current.condition}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Humidity</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{baseWeather.current.humidity}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Wind Speed</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatWind(baseWeather.current.windSpeed, unit)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">UV Index</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{baseWeather.current.uvIndex} / 11</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">Loading primary weather...</div>
              )}
            </div>

            {/* City 2 Card (Target) */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Comparing Location</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {targetLocation.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{targetLocation.country}</p>
                </div>
                {targetWeather && (
                  <WeatherIcon
                    code={targetWeather.current.conditionCode}
                    isDay={targetWeather.current.isDay}
                    className="w-12 h-12"
                  />
                )}
              </div>

              {targetWeather ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatTemp(targetWeather.current.temp, unit)}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Feels like {formatTemp(targetWeather.current.feelsLike, unit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Condition</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetWeather.current.condition}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Humidity</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetWeather.current.humidity}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">Wind Speed</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatWind(targetWeather.current.windSpeed, unit)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-zinc-400 block text-[10px]">UV Index</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetWeather.current.uvIndex} / 11</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 animate-pulse">Loading comparison data...</div>
              )}
            </div>
          </div>

          {/* Differential Insights Summary */}
          {baseWeather && targetWeather && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/70 text-xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-indigo-950 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Atmospheric Difference Breakdown</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    Temperature is{' '}
                    <strong className="font-semibold">
                      {Math.abs(tempDiff)}° {tempDiff >= 0 ? 'warmer' : 'cooler'}
                    </strong>{' '}
                    in {targetLocation.name}.
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Humidity is{' '}
                    <strong className="font-semibold">
                      {Math.abs(humidityDiff)}% {humidityDiff >= 0 ? 'higher' : 'lower'}
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-500" />
                  <span>
                    Wind speed is{' '}
                    <strong className="font-semibold">
                      {Math.abs(windDiff)} km/h {windDiff >= 0 ? 'faster' : 'calmer'}
                    </strong>
                    .
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
