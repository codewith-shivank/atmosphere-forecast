import React, { useState } from 'react';
import { AreaChart, CloudRain, Sparkles, Thermometer } from 'lucide-react';
import { HourlyForecastItem, Unit } from '../types/weather';
import { convertTemp, formatTemp } from '../utils/formatters';

interface WeatherChartProps {
  items: HourlyForecastItem[];
  unit: Unit;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ items, unit }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  // Take next 24 hours
  const data = items.slice(0, 24);
  const temps = data.map((d) => convertTemp(d.temp, unit));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const currentT = convertTemp(d.temp, unit);
    // Invert y: high temp is at lower y
    const y = paddingTop + chartHeight - ((currentT - minTemp) / tempRange) * chartHeight;
    return { x, y, data: d, tempVal: currentT };
  });

  // Build SVG path (smooth bezier curve)
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Fill gradient area below the line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <AreaChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Interactive 24-Hour Temperature Curve
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Hover over the curve to inspect hourly temps and precipitation probability
            </p>
          </div>
        </div>

        {activePoint ? (
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{activePoint.data.hour}</span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
              <Thermometer className="w-3.5 h-3.5" />
              {formatTemp(activePoint.data.temp, unit)}
            </span>
            <span className="flex items-center gap-1 text-blue-500 font-medium">
              <CloudRain className="w-3.5 h-3.5" />
              {activePoint.data.precipitationProb}%
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">{activePoint.data.condition}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>High: {formatTemp(maxTemp, 'celsius' === unit ? 'celsius' : 'fahrenheit')} | Low: {formatTemp(minTemp, 'celsius' === unit ? 'celsius' : 'fahrenheit')}</span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px] relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 select-none"
            onMouseLeave={() => setActiveIdx(null)}
          >
            <defs>
              <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Precipitation probability background bars */}
            {points.map((p, i) => {
              const barHeight = (p.data.precipitationProb / 100) * 45;
              return (
                <rect
                  key={`rain-${i}`}
                  x={p.x - 6}
                  y={svgHeight - paddingBottom - barHeight}
                  width={12}
                  height={barHeight}
                  rx={2}
                  className="fill-sky-500/20 dark:fill-sky-400/20"
                />
              );
            })}

            {/* Area fill under temperature curve */}
            <path d={areaD} fill="url(#tempAreaGradient)" />

            {/* Temperature Stroke Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Points and Labels */}
            {points.map((p, i) => {
              const isSelected = activeIdx === i;
              const showLabel = i % 3 === 0 || i === points.length - 1;

              return (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i)}
                >
                  {/* Invisible broad hover target */}
                  <rect
                    x={p.x - 14}
                    y={0}
                    width={28}
                    height={svgHeight}
                    fill="transparent"
                  />

                  {/* Temperature circle point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 6 : 3.5}
                    className={`transition-all duration-150 ${
                      isSelected
                        ? 'fill-sky-500 stroke-white dark:stroke-zinc-900 stroke-2 shadow'
                        : 'fill-white dark:fill-zinc-900 stroke-sky-500 stroke-2'
                    }`}
                  />

                  {/* Temp label on node if spaced */}
                  {(showLabel || isSelected) && (
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold transition-all ${
                        isSelected
                          ? 'fill-sky-600 dark:fill-sky-400 font-bold text-xs'
                          : 'fill-zinc-600 dark:fill-zinc-400'
                      }`}
                    >
                      {formatTemp(p.data.temp, unit)}
                    </text>
                  )}

                  {/* Hour label below */}
                  {showLabel && (
                    <text
                      x={p.x}
                      y={svgHeight - 14}
                      textAnchor="middle"
                      className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-medium"
                    >
                      {p.data.hour}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Active Vertical Crosshair */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={svgHeight - paddingBottom}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="pointer-events-none"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
