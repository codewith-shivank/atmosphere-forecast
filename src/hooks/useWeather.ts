import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeatherData, reverseGeocode } from '../services/weatherApi';
import { Location, Unit, WeatherData } from '../types/weather';

const DEFAULT_LOCATION: Location = {
  name: 'San Francisco',
  admin1: 'California',
  country: 'United States',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
};

const STORAGE_KEYS = {
  LOCATION: 'atmosphere_last_location',
  UNIT: 'atmosphere_temp_unit',
} as const;

// In-memory cache: keyed by lat,lng — valid for 2 minutes
const CACHE_TTL = 2 * 60 * 1000;
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();

function cacheKey(loc: Location): string {
  return `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;
}

function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of weatherCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      weatherCache.delete(key);
    }
  }
}

function getSavedUnit(): Unit {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.UNIT);
    if (saved === 'celsius' || saved === 'fahrenheit') return saved;
  } catch {
    // ignore storage access errors
  }
  return 'celsius';
}

function getSavedLocation(): Location {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate required fields before trusting the stored value
      if (parsed?.latitude && parsed?.longitude && parsed?.name && typeof parsed?.country === 'string') {
        return parsed as Location;
      }
    }
  } catch {
    // ignore parse / storage errors
  }
  return DEFAULT_LOCATION;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnitState] = useState<Unit>(getSavedUnit);
  const [currentLocation, setCurrentLocation] = useState<Location>(getSavedLocation);

  // Keep a ref to the current location so callbacks can always read the latest
  // without needing to be recreated every time location changes.
  const currentLocationRef = useRef<Location>(currentLocation);
  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  const setUnit = useCallback((newUnit: Unit) => {
    setUnitState(newUnit);
    try {
      localStorage.setItem(STORAGE_KEYS.UNIT, newUnit);
    } catch {
      // ignore
    }
  }, []);

  const loadWeather = useCallback(async (loc: Location, force = false) => {
    const key = cacheKey(loc);

    // Check in-memory cache first (unit changes are display-only — raw data is unit-agnostic)
    clearExpiredCache();
    if (!force) {
      const cached = weatherCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setWeather(cached.data);
        setCurrentLocation(loc);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(loc);

      weatherCache.set(key, { data, timestamp: Date.now() });

      setWeather(data);
      setCurrentLocation(loc);
      try {
        localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
      } catch {
        // ignore
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []); // no deps — fetchWeatherData is stable, cache is module-level

  const selectLocation = useCallback((loc: Location) => {
    loadWeather(loc);
  }, [loadWeather]);

  const refresh = useCallback(() => {
    loadWeather(currentLocationRef.current, true);
  }, [loadWeather]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoInfo = await reverseGeocode(latitude, longitude);
          const loc: Location = {
            name: geoInfo.name,
            admin1: geoInfo.admin1,
            country: geoInfo.country,
            latitude,
            longitude,
          };
          await loadWeather(loc);
        } catch {
          // If reverse geocoding fails, still show weather with coordinates only
          await loadWeather({
            name: 'Current Location',
            country: '',
            latitude,
            longitude,
          });
        }
      },
      (geoError) => {
        let message = 'Unable to retrieve your current location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = 'Location permission denied. Please search for a city instead.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable. Please try again.';
        } else if (geoError.code === geoError.TIMEOUT) {
          message = 'Location request timed out. Check your connection and try again.';
        }
        setError(message);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, [loadWeather]);

  // Initial load — runs once on mount using the resolved starting location
  useEffect(() => {
    loadWeather(currentLocationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    weather,
    loading,
    error,
    unit,
    currentLocation,
    setUnit,
    selectLocation,
    detectLocation,
    refresh,
  };
}
