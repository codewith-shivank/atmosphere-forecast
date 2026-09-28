import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { Layers, MapPin, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { Location, Unit, WeatherData } from '../types/weather';
import { formatTemp } from '../utils/formatters';

interface WeatherMapProps {
  location: Location;
  weather?: WeatherData | null;
  unit: Unit;
  theme: 'light' | 'dark' | 'system';
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ location, weather, unit, theme }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  const [showRadar, setShowRadar] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create custom pulsing icon
      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;
      const baseTileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      const tileUrl = cartoApiKey ? `${baseTileUrl}?api_key=${cartoApiKey}` : baseTileUrl;

      L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      // Radar layer (RainViewer tile API)
      const radar = L.tileLayer(
        'https://tilecache.rainviewer.com/v2/radar/nowcast_10/256/{z}/{x}/{y}/2/1_1.png',
        {
          opacity: 0.65,
          zIndex: 10,
        },
      );

      if (showRadar) {
        radar.addTo(map);
      }
      radarLayerRef.current = radar;

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      map.setView([location.latitude, location.longitude], 9, { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
      }
    }
  }, [location.latitude, location.longitude, isDark]);

  // Toggle radar layer
  useEffect(() => {
    if (!mapInstanceRef.current || !radarLayerRef.current) return;
    if (showRadar) {
      if (!mapInstanceRef.current.hasLayer(radarLayerRef.current)) {
        radarLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(radarLayerRef.current)) {
        radarLayerRef.current.remove();
      }
    }
  }, [showRadar]);

  // Recalculate map size on resize/expand
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const recenter = () => {
    mapInstanceRef.current?.setView([location.latitude, location.longitude], 10, { animate: true });
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'p-6' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Interactive Weather & Precipitation Radar
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Real-time precipitation radar & satellite mapping
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRadar(!showRadar)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all focus-ring ${
              showRadar
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showRadar ? 'bg-white animate-pulse' : 'bg-zinc-400'}`} />
            Radar Layer
          </button>

          <button
            type="button"
            onClick={recenter}
            title="Recenter Map"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors focus-ring"
            aria-label="Recenter Map"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Map' : 'Expand Map'}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors focus-ring"
            aria-label={isExpanded ? 'Collapse Map' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900">
        <div
          ref={mapContainerRef}
          className={`w-full transition-all duration-300 z-0 ${isExpanded ? 'h-96 sm:h-[480px]' : 'h-64 sm:h-72'}`}
        />

        {/* Floating Weather Info Badge */}
        {weather && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md text-xs flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{location.name}</span>
              <span className="text-zinc-500 dark:text-zinc-400 ml-1.5">
                {formatTemp(weather.current.temp, unit)} • {weather.current.condition}
              </span>
            </div>
          </div>
        )}

        {/* Coordinate badge bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
          {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
        </div>
      </div>
    </div>
  );
};
