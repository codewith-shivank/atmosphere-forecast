import React from 'react';
import { CloudRain, Droplets, Eye, Gauge, Thermometer, Wind, Sunrise, Sunset, Zap } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';
import { CurrentWeather as CurrentWeatherType, Location, Unit } from '../types/weather';
import { formatTemp, formatWind, formatVisibility, formatPressure, getWindCompass, getUvLabel } from '../utils/formatters';

interface CurrentWeatherProps {
  current: CurrentWeatherType;
  location: Location;
  unit: Unit;
  updatedAt: string;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  current,
  location,
  unit,
  updatedAt,
}) => {
  const locationSubtitle = [location.admin1, location.country].filter(Boolean).join(', ');
  const uvInfo = getUvLabel(current.uvIndex);

  return (
    <section
      aria-label={`Current weather for ${location.name}`}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs dark:shadow-none"
    >
      {/* Top row: Location & Updated timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {location.name}
          </h1>
          {locationSubtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{locationSubtitle}</p>
          )}
        </div>
        <time className="text-xs text-zinc-400 dark:text-zinc-500 font-normal shrink-0">
          Updated {updatedAt}
        </time>
      </div>

      {/* Main hero reading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-5">
          <WeatherIcon
            code={current.conditionCode}
            isDay={current.isDay}
            className="w-16 h-16 sm:w-20 sm:h-20 shrink-0"
          />
          <div>
            <div
              className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums"
              aria-label={`${formatTemp(current.temp, unit)} current temperature`}
            >
              {formatTemp(current.temp, unit)}
            </div>
            <div className="text-base sm:text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-1">
              {current.condition}
            </div>
          </div>
        </div>

        {/* High / Low & Feels Like summary */}
        <div className="flex sm:flex-col sm:items-end justify-between text-sm text-zinc-600 dark:text-zinc-400 gap-1 bg-zinc-50 dark:bg-zinc-800/30 sm:bg-transparent p-3 sm:p-0 rounded-xl">
          <div className="flex items-center gap-3">
            <span>
              H: <strong className="font-semibold text-zinc-900 dark:text-zinc-200 tabular-nums">{formatTemp(current.high, unit)}</strong>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">/</span>
            <span>
              L: <strong className="font-semibold text-zinc-900 dark:text-zinc-200 tabular-nums">{formatTemp(current.low, unit)}</strong>
            </span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Feels like <span className="font-medium text-zinc-800 dark:text-zinc-300 tabular-nums">{formatTemp(current.feelsLike, unit)}</span>
          </div>
        </div>
      </div>

      {/* Weather Metrics Grid — primary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
        {/* Feels Like */}
        <MetricItem
          icon={<Thermometer className="w-4 h-4" />}
          label="Feels Like"
          value={formatTemp(current.feelsLike, unit)}
        />

        {/* Humidity */}
        <MetricItem
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          value={`${current.humidity}%`}
        />

        {/* Wind */}
        <MetricItem
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          value={formatWind(current.windSpeed, unit)}
          sub={getWindCompass(current.windDirection)}
        />

        {/* Precipitation */}
        <MetricItem
          icon={<CloudRain className="w-4 h-4" />}
          label="Precipitation"
          value={current.precipitation > 0 ? `${current.precipitation} mm` : '0 mm'}
        />
      </div>

      {/* Extended metrics — only when data is available */}
      {(current.pressure !== undefined ||
        current.visibility !== undefined ||
        current.uvIndex !== 0 ||
        current.dewPoint !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
          {/* UV Index */}
          <MetricItem
            icon={<Zap className="w-4 h-4" />}
            label="UV Index"
            value={`${current.uvIndex}`}
            sub={current.uvIndex > 0 ? uvInfo.label : undefined}
          />

          {/* Pressure */}
          {current.pressure !== undefined && (
            <MetricItem
              icon={<Gauge className="w-4 h-4" />}
              label="Pressure"
              value={formatPressure(current.pressure, unit)}
            />
          )}

          {/* Visibility */}
          {current.visibility !== undefined && (
            <MetricItem
              icon={<Eye className="w-4 h-4" />}
              label="Visibility"
              value={formatVisibility(current.visibility, unit)}
            />
          )}

          {/* Dew Point */}
          {current.dewPoint !== undefined && (
            <MetricItem
              icon={<Droplets className="w-4 h-4" />}
              label="Dew Point"
              value={formatTemp(current.dewPoint, unit)}
            />
          )}
        </div>
      )}

      {/* Sunrise/Sunset — only when available */}
      {(current.sunrise || current.sunset) && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
          {current.sunrise && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-amber-500 border border-zinc-100 dark:border-zinc-700" aria-hidden="true">
                <Sunrise className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Sunrise</div>
                <time className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5 block">
                  {current.sunrise}
                </time>
              </div>
            </div>
          )}
          {current.sunset && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sky-600 dark:text-sky-400 border border-zinc-100 dark:border-zinc-700" aria-hidden="true">
                <Sunset className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Sunset</div>
                <time className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5 block">
                  {current.sunset}
                </time>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// ── Small internal helper to avoid repetition ──────────────────────────────────
interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-3">
    <div
      className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700 shrink-0"
      aria-hidden="true"
    >
      {icon}
    </div>
    <div>
      <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{label}</div>
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
        {value}
        {sub && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1">{sub}</span>
        )}
      </div>
    </div>
  </div>
);