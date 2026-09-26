import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { HourlyForecastItem, Unit } from '../types/weather';
import { formatTemp } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  unit: Unit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ items, unit }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Hourly Forecast
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
              }
            }}
            className="p-1 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Scroll hourly forecast left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
              }
            }}
            className="p-1 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Scroll hourly forecast right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
        tabIndex={0}
      >
        {items.map((item, idx) => {
          const isNow = idx === 0;
          return (
            <div
              key={`${item.time}-${idx}`}
              className={`flex flex-col items-center justify-between min-w-[72px] sm:min-w-[80px] py-3 px-2 rounded-xl transition-colors shrink-0 snap-start text-center ${
                isNow
                  ? 'bg-zinc-100 dark:bg-zinc-800/50 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className={`text-xs ${isNow ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.hour}
              </span>

              <div className="my-2.5 flex flex-col items-center gap-1">
                <WeatherIcon
                  code={item.conditionCode}
                  isDay={item.isDay}
                  className="w-6 h-6"
                />
                {item.precipitationProb > 15 ? (
                  <div className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{item.precipitationProb}%</span>
                  </div>
                ) : (
                  <div className="h-[14px]" />
                )}
              </div>

              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatTemp(item.temp, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};