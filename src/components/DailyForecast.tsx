import React from 'react';
import { Droplets } from 'lucide-react';
import { DailyForecastItem, Unit } from '../types/weather';
import { formatTemp } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  items: DailyForecastItem[];
  unit: Unit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ items, unit }) => {
  if (!items || items.length === 0) return null;

  // Calculate weekly bounds for temperature range visualization
  const weeklyMin = Math.min(...items.map((i) => i.minTemp));
  const weeklyMax = Math.max(...items.map((i) => i.maxTemp));
  const rangeDelta = Math.max(weeklyMax - weeklyMin, 1);

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs dark:shadow-none">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
        7-Day Forecast
      </h2>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((day) => {
          // Calculate relative position of min and max along the weekly bar
          const leftPercent = Math.max(0, Math.min(90, ((day.minTemp - weeklyMin) / rangeDelta) * 100));
          const widthPercent = Math.max(10, Math.min(100 - leftPercent, ((day.maxTemp - day.minTemp) / rangeDelta) * 100));

          return (
            <div
              key={day.date}
              className="py-3 sm:py-3.5 flex items-center justify-between gap-3 text-sm"
            >
              {/* Day name */}
              <div className="w-24 sm:w-28 font-medium text-zinc-800 dark:text-zinc-200 shrink-0">
                {day.day}
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <WeatherIcon code={day.conditionCode} className="w-5 h-5 shrink-0" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate hidden md:inline">
                  {day.condition}
                </span>
                {day.precipitationProb > 15 && (
                  <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium shrink-0 tabular-nums">
                    <Droplets className="w-3 h-3" />
                    {day.precipitationProb}%
                  </span>
                )}
              </div>

              {/* Min Temp, Range Bar, Max Temp */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tabular-nums w-8 text-right">
                  {formatTemp(day.minTemp, unit)}
                </span>

                {/* Relative temperature range bar with gradient */}
                <div className="w-20 sm:w-28 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 temp-range-bg rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums w-8 text-left">
                  {formatTemp(day.maxTemp, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};