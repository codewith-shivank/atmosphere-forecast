import { describe, expect, it } from 'vitest';
import {
  convertTemp,
  convertWind,
  formatDateLong,
  formatPercentage,
  formatPressure,
  formatTemp,
  formatVisibility,
  formatWind,
  getUvLabel,
  getWindCompass,
  kmhToMph,
  kmToMiles,
} from './formatters';

describe('formatters utility suite', () => {
  describe('Temperature conversion and formatting', () => {
    it('formats Celsius correctly', () => {
      expect(formatTemp(20, 'celsius')).toBe('20°');
      expect(formatTemp(0, 'celsius')).toBe('0°');
      expect(formatTemp(-5.4, 'celsius')).toBe('-5°');
    });

    it('formats Fahrenheit correctly', () => {
      expect(formatTemp(0, 'fahrenheit')).toBe('32°');
      expect(formatTemp(20, 'fahrenheit')).toBe('68°');
      expect(formatTemp(100, 'fahrenheit')).toBe('212°');
    });

    it('converts temperature numerically', () => {
      expect(convertTemp(20, 'celsius')).toBe(20);
      expect(convertTemp(20, 'fahrenheit')).toBe(68);
    });
  });

  describe('Wind and Distance conversions', () => {
    it('converts km/h to mph correctly', () => {
      expect(kmhToMph(100)).toBe(62);
      expect(kmToMiles(10)).toBe(6);
    });

    it('formats wind string with proper unit suffix', () => {
      expect(formatWind(25, 'celsius')).toBe('25 km/h');
      expect(formatWind(25, 'fahrenheit')).toBe('16 mph');
    });

    it('converts wind numerically', () => {
      expect(convertWind(25, 'celsius')).toBe(25);
      expect(convertWind(25, 'fahrenheit')).toBe(16);
    });

    it('determines correct wind compass directions', () => {
      expect(getWindCompass(0)).toBe('N');
      expect(getWindCompass(90)).toBe('E');
      expect(getWindCompass(180)).toBe('S');
      expect(getWindCompass(270)).toBe('W');
    });
  });

  describe('Atmospheric Metrics', () => {
    it('formats pressure in hPa and inHg', () => {
      expect(formatPressure(1013, 'celsius')).toBe('1013 hPa');
      expect(formatPressure(1013, 'fahrenheit')).toBe('30 in');
    });

    it('formats visibility properly', () => {
      expect(formatVisibility(10, 'celsius')).toBe('10 km');
      expect(formatVisibility(10, 'fahrenheit')).toBe('6 mi');
    });

    it('formats percentages', () => {
      expect(formatPercentage(75.4)).toBe('75%');
    });

    it('returns appropriate UV labels and severity levels', () => {
      expect(getUvLabel(1)).toEqual({ label: 'Low', severity: 'low' });
      expect(getUvLabel(4)).toEqual({ label: 'Moderate', severity: 'moderate' });
      expect(getUvLabel(6)).toEqual({ label: 'High', severity: 'high' });
      expect(getUvLabel(8)).toEqual({ label: 'Very High', severity: 'very-high' });
      expect(getUvLabel(11)).toEqual({ label: 'Extreme', severity: 'extreme' });
    });

    it('formats date strings', () => {
      const dateStr = '2026-06-15';
      const formatted = formatDateLong(dateStr);
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
    });
  });
});
