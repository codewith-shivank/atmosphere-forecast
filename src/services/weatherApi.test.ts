import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAirQuality, fetchWeatherData, getWeatherCondition, searchCities } from './weatherApi';

describe('weatherApi service suite', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getWeatherCondition WMO translation', () => {
    it('translates known WMO codes', () => {
      expect(getWeatherCondition(0)).toBe('Clear sky');
      expect(getWeatherCondition(1)).toBe('Mainly clear');
      expect(getWeatherCondition(61)).toBe('Slight rain');
      expect(getWeatherCondition(95)).toBe('Thunderstorm');
    });

    it('falls back gracefully on unknown code', () => {
      expect(getWeatherCondition(9999)).toBe('Partly cloudy');
    });
  });

  describe('searchCities', () => {
    it('returns empty array if query is shorter than 2 characters', async () => {
      const results = await searchCities('a');
      expect(results).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('parses geocoding results correctly', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Tokyo',
            admin1: 'Tokyo',
            country: 'Japan',
            country_code: 'JP',
            latitude: 35.6895,
            longitude: 139.6917,
            timezone: 'Asia/Tokyo',
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchCities('Tokyo');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Tokyo');
      expect(results[0].country).toBe('Japan');
      expect(results[0].latitude).toBe(35.6895);
    });

    it('throws error when geocoding network request fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(searchCities('London')).rejects.toThrow('Failed to search locations');
    });
  });

  describe('fetchAirQuality', () => {
    it('parses air quality metrics correctly', async () => {
      const mockAqi = {
        current: {
          european_aqi: 18,
          us_aqi: 30,
          pm2_5: 8.5,
          pm10: 14.2,
          nitrogen_dioxide: 11.0,
          sulphur_dioxide: 3.5,
          ozone: 42.0,
          carbon_monoxide: 210,
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAqi,
      });

      const data = await fetchAirQuality(35.6895, 139.6917);
      expect(data.europeanAqi).toBe(18);
      expect(data.usAqi).toBe(30);
      expect(data.pm25).toBe(9);
      expect(data.pm10).toBe(14);
    });
  });
});
