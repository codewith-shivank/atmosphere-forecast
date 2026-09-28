import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Download, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { AirQualityData, Location, Unit, WeatherData } from '../types/weather';
import { formatTemp, formatWind } from '../utils/formatters';

interface ExportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  weather: WeatherData | null;
  airQuality?: AirQualityData | null;
  unit: Unit;
}

export const ExportCardModal: React.FC<ExportCardModalProps> = ({
  isOpen,
  onClose,
  location,
  weather,
  airQuality,
  unit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [cardTheme, setCardTheme] = useState<'dark' | 'glass'>('dark');

  useEffect(() => {
    if (!isOpen || !weather || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (Hi-DPI friendly)
    const width = 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (cardTheme === 'dark') {
      bgGradient.addColorStop(0, '#09090b');
      bgGradient.addColorStop(0.5, '#18181b');
      bgGradient.addColorStop(1, '#0f172a');
    } else {
      bgGradient.addColorStop(0, '#0284c7');
      bgGradient.addColorStop(0.5, '#0369a1');
      bgGradient.addColorStop(1, '#1e1b4b');
    }

    ctx.fillStyle = bgGradient;
    ctx.roundRect(0, 0, width, height, 32);
    ctx.fill();

    // Border stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Atmosphere Weather Brand
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('🌦️ Atmosphere Weather', 50, 60);

    // Timestamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Live Forecast • ${weather.updatedAt}`, width - 50, 60);
    ctx.textAlign = 'left';

    // Location Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(location.name, 50, 130);

    // Country subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Plus Jakarta Sans", system-ui, sans-serif';
    const subtitle = [location.admin1, location.country].filter(Boolean).join(', ');
    ctx.fillText(subtitle, 50, 160);

    // Temperature Hero
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(formatTemp(weather.current.temp, unit), 50, 260);

    // Condition
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(weather.current.condition, 50, 305);

    // Feels like & High/Low
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      `Feels like ${formatTemp(weather.current.feelsLike, unit)}  •  High: ${formatTemp(
        weather.current.high,
        unit,
      )} / Low: ${formatTemp(weather.current.low, unit)}`,
      50,
      335,
    );

    // Metric Badges on the right side
    const metrics = [
      { label: 'Humidity', value: `${weather.current.humidity}%` },
      { label: 'Wind Speed', value: formatWind(weather.current.windSpeed, unit) },
      { label: 'UV Index', value: `${weather.current.uvIndex} / 11` },
      { label: 'Air Quality', value: airQuality ? `EAQI ${airQuality.europeanAqi}` : 'Good' },
    ];

    const boxWidth = 145;
    const boxHeight = 90;
    const startX = width - 360;
    const startY = 120;

    metrics.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (boxWidth + 15);
      const y = startY + row * (boxHeight + 15);

      // Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.roundRect(x, y, boxWidth, boxHeight, 16);
      ctx.fill();

      // Card Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Metric Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '12px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(m.label, x + 16, y + 32);

      // Metric Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(m.value, x + 16, y + 64);
    });

    // Footer Attribution Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '13px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Generated with Atmosphere Weather • Powered by Open-Meteo', 50, height - 35);
  }, [isOpen, weather, location, airQuality, unit, cardTheme]);

  if (!isOpen || !weather) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    const canvas = canvasRef.current;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `atmosphere-weather-${location.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = imageUri;
    link.click();
    setTimeout(() => {
      setDownloading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Export Weather Snapshot
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Download a high-resolution shareable weather card
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

        {/* Theme Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Style:</span>
          <button
            type="button"
            onClick={() => setCardTheme('dark')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              cardTheme === 'dark'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            Midnight Dark
          </button>
          <button
            type="button"
            onClick={() => setCardTheme('glass')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              cardTheme === 'glass'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            Atmosphere Blue
          </button>
        </div>

        {/* Canvas Preview Container */}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-2 flex justify-center items-center shadow-inner">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[300px] object-contain rounded-xl"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            {downloading ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PNG Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
