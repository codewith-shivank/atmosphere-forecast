import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAirQuality, fetchWeatherData, reverseGeocode } from '../services/weatherApi';
import { AirQualityData, Location, Unit, WeatherData } from '../types/weather';
import { geolocationErrorMessage, GpsFix, locateLikeMaps } from '../utils/geolocation';

export const DEFAULT_LOCATION: Location = {
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

function getSavedUnit(): Unit {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const unitParam = urlParams.get('unit');
    if (unitParam === 'celsius' || unitParam === 'fahrenheit') return unitParam;

    const saved = localStorage.getItem(STORAGE_KEYS.UNIT);
    if (saved === 'celsius' || saved === 'fahrenheit') return saved;
  } catch {
    // ignore
  }
  return 'celsius';
}

function hasExplicitUrlLocation(): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(urlParams.get('lat') || '');
    const lon = parseFloat(urlParams.get('lon') || '');
    return Number.isFinite(lat) && Number.isFinite(lon);
  } catch {
    return false;
  }
}

function hasSavedLocation(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return Boolean(parsed?.latitude && parsed?.longitude && parsed?.name);
  } catch {
    return false;
  }
}

function getInitialLocation(): Location {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');
    const city = urlParams.get('city');

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return {
          name: city || 'Selected Location',
          country: urlParams.get('country') || '',
          admin1: urlParams.get('admin1') || undefined,
          latitude,
          longitude,
        };
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.latitude && parsed?.longitude && parsed?.name && typeof parsed?.country === 'string') {
        return parsed as Location;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCATION;
}

export function useWeather() {
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<Location>(getInitialLocation);
  const [unit, setUnitState] = useState<Unit>(getSavedUnit);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsFix, setGpsFix] = useState<GpsFix | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const followRef = useRef(false);

  // Sync state with URL search parameters
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('city', currentLocation.name);
      url.searchParams.set('lat', currentLocation.latitude.toFixed(4));
      url.searchParams.set('lon', currentLocation.longitude.toFixed(4));
      url.searchParams.set('unit', unit);
      if (currentLocation.country) {
        url.searchParams.set('country', currentLocation.country);
      }
      window.history.replaceState({}, '', url.toString());
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(currentLocation));
      localStorage.setItem(STORAGE_KEYS.UNIT, unit);
    } catch {
      // ignore
    }
  }, [currentLocation, unit]);

  // TanStack Query for Weather Data
  const weatherQuery = useQuery<WeatherData, Error>({
    queryKey: ['weather', currentLocation.latitude.toFixed(4), currentLocation.longitude.toFixed(4)],
    queryFn: ({ signal }) => fetchWeatherData(currentLocation),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // TanStack Query for Air Quality Data
  const airQualityQuery = useQuery<AirQualityData, Error>({
    queryKey: ['airQuality', currentLocation.latitude.toFixed(4), currentLocation.longitude.toFixed(4)],
    queryFn: ({ signal }) => fetchAirQuality(currentLocation.latitude, currentLocation.longitude, signal),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const setUnit = useCallback((newUnit: Unit) => {
    setUnitState(newUnit);
  }, []);

  const selectLocation = useCallback((loc: Location) => {
    setGeoError(null);
    setCurrentLocation(loc);
  }, []);

  const refresh = useCallback(() => {
    setGeoError(null);
    queryClient.invalidateQueries({
      queryKey: ['weather', currentLocation.latitude.toFixed(4), currentLocation.longitude.toFixed(4)],
    });
    queryClient.invalidateQueries({
      queryKey: ['airQuality', currentLocation.latitude.toFixed(4), currentLocation.longitude.toFixed(4)],
    });
  }, [queryClient, currentLocation]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);

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
          selectLocation(loc);
        } catch {
          selectLocation({
            name: 'Current Location',
            country: '',
            latitude,
            longitude,
          });
        }
      },
      (err) => {
        let message = 'Unable to retrieve your current location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location permission denied. Please search for a city manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out.';
        }
        setGeoError(message);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, [selectLocation]);

  const error = geoError || weatherQuery.error?.message || null;

  return {
    weather: weatherQuery.data ?? null,
    airQuality: airQualityQuery.data ?? null,
    loading: weatherQuery.isLoading || (weatherQuery.isFetching && !weatherQuery.data),
    isFetching: weatherQuery.isFetching,
    airQualityLoading: airQualityQuery.isLoading,
    error,
    unit,
    currentLocation,
    setUnit,
    selectLocation,
    detectLocation,
    refresh,
  };
}
