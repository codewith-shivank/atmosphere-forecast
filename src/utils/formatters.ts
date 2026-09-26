import { Unit } from '../types/weather';

/**
 * Format a Celsius temperature for display in the selected unit.
 * Always includes the degree symbol and rounds to a whole number.
 */
export function formatTemp(celsius: number, unit: Unit): string {
  if (unit === 'fahrenheit') {
    return `${Math.round((celsius * 9) / 5 + 32)}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Convert a Celsius value to the numeric value for the selected unit.
 */
export function convertTemp(celsius: number, unit: Unit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Format wind speed. Open-Meteo returns km/h.
 */
export function formatWind(kmh: number, unit: Unit): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Convert wind speed numerically.
 */
export function convertWind(kmh: number, unit: Unit): number {
  if (unit === 'fahrenheit') {
    return Math.round(kmh * 0.621371);
  }
  return Math.round(kmh);
}

/**
 * Convert km/h to mph.
 */
export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

/**
 * Convert kilometers to miles.
 */
export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371);
}

/**
 * Get human-readable compass direction from wind degrees.
 */
export function getWindCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Convert percentage (0–100) into a descriptive string.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Convert visibility distance into a readable label with unit.
 */
export function formatVisibility(km: number, unit: Unit): string {
  const miles = kmToMiles(km);
  return unit === 'fahrenheit' ? `${miles} mi` : `${km} km`;
}

/**
 * Format pressure in hPa.
 */
export function formatPressure(hpa: number, unit: Unit): string {
  const displayValue = unit === 'fahrenheit' ? Math.round(hpa * 0.02953) : Math.round(hpa);
  return `${displayValue}${unit === 'fahrenheit' ? ' in' : ' hPa'}`;
}

/**
 * Get a human-readable UV index label with severity.
 */
export function getUvLabel(index: number): { label: string; severity: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme' } {
  if (index <= 2) return { label: 'Low', severity: 'low' };
  if (index <= 5) return { label: 'Moderate', severity: 'moderate' };
  if (index <= 7) return { label: 'High', severity: 'high' };
  if (index <= 9) return { label: 'Very High', severity: 'very-high' };
  return { label: 'Extreme', severity: 'extreme' };
}

/**
 * Format a Date into a readable day/month format.
 */
export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
