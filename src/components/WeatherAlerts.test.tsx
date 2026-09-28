import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AirQualityData, CurrentWeather } from '../types/weather';
import { computeWeatherAlerts, WeatherAlerts } from './WeatherAlerts';

const mockCurrentNormal: CurrentWeather = {
  temp: 20,
  feelsLike: 20,
  condition: 'Clear sky',
  conditionCode: 0,
  high: 24,
  low: 16,
  humidity: 50,
  windSpeed: 10,
  windDirection: 90,
  uvIndex: 3,
  precipitation: 0,
  isDay: true,
};

const mockCurrentHazard: CurrentWeather = {
  temp: 32,
  feelsLike: 36,
  condition: 'Severe thunderstorm',
  conditionCode: 99,
  high: 34,
  low: 24,
  humidity: 85,
  windSpeed: 55,
  windDirection: 270,
  uvIndex: 9,
  precipitation: 25,
  isDay: true,
};

const mockAqiHazard: AirQualityData = {
  europeanAqi: 85,
  usAqi: 165,
  pm25: 45,
  pm10: 90,
  nitrogenDioxide: 50,
  sulphurDioxide: 20,
  ozone: 110,
  carbonMonoxide: 800,
  updatedAt: '2:00 PM',
};

describe('WeatherAlerts component & computeWeatherAlerts', () => {
  it('returns empty alerts when weather is normal', () => {
    const alerts = computeWeatherAlerts(mockCurrentNormal, null, 'celsius');
    expect(alerts).toHaveLength(0);
  });

  it('detects multiple hazards for severe storm, high UV, high wind, and poor AQI', () => {
    const alerts = computeWeatherAlerts(mockCurrentHazard, mockAqiHazard, 'celsius');
    expect(alerts.length).toBeGreaterThanOrEqual(3);

    const alertTitles = alerts.map((a) => a.title);
    expect(alertTitles.some((t) => t.includes('Thunderstorm'))).toBe(true);
    expect(alertTitles.some((t) => t.includes('UV Radiation'))).toBe(true);
    expect(alertTitles.some((t) => t.includes('High Wind'))).toBe(true);
    expect(alertTitles.some((t) => t.includes('Air Quality'))).toBe(true);
  });

  it('renders alert cards and allows expanding for safety tips', () => {
    render(<WeatherAlerts current={mockCurrentHazard} airQuality={mockAqiHazard} unit="celsius" />);

    expect(screen.getByText(/Active Thunderstorm Warning/i)).toBeInTheDocument();
    
    // Click card to expand
    const thunderstormCard = screen.getByText(/Active Thunderstorm Warning/i);
    fireEvent.click(thunderstormCard);

    expect(screen.getByText(/Recommended Safety Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay indoors away from windows/i)).toBeInTheDocument();
  });

  it('allows dismissing individual alerts', () => {
    render(<WeatherAlerts current={mockCurrentHazard} airQuality={mockAqiHazard} unit="celsius" />);

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    expect(dismissButtons.length).toBeGreaterThan(0);

    fireEvent.click(dismissButtons[0]);
    // Alert was dismissed
  });
});
