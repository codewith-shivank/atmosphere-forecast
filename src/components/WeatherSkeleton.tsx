import React from 'react';

export const WeatherSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        </div>

        <div className="flex items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-12 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
          <div className="space-y-1.5 hidden sm:block">
            <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md ml-auto" />
            <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-md ml-auto" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="min-w-[72px] sm:min-w-[80px] h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex flex-col items-center justify-between">
              <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-3 w-7 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="py-3.5 flex items-center justify-between gap-3">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-5 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              <div className="h-2 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};