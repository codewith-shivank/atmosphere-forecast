import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentWeather as CurrentWeatherType, Location } from '../types/weather';
import { CurrentWeather } from './CurrentWeather';

const mockLocation: Location = {
  name: 'London',
  admin1: 'England',
  country: 'United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
};

const mockCurrent: CurrentWeatherType = {
  temp: 18,
  feelsLike: 17,
  condition: 'Mainly clear',
  conditionCode: 1,
  high: 22,
  low: 14,
  humidity: 65,
  windSpeed: 15,
  windDirection: 180,
  uvIndex: 4,
  precipitation: 0,
  isDay: true,
  pressure: 1015,
  visibility: 10,
  dewPoint: 11,
  sunrise: '6:15 AM',
  sunset: '8:45 PM',
};

describe('CurrentWeather component', () => {
  it('renders location name and country', () => {
    render(
      <CurrentWeather
        current={mockCurrent}
        location={mockLocation}
        unit="celsius"
        updatedAt="10:30 AM"
      />,
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('England, United Kingdom')).toBeInTheDocument();
  });

  it('renders temperature in Celsius and Fahrenheit depending on unit', () => {
    const { rerender } = render(
      <CurrentWeather
        current={mockCurrent}
        location={mockLocation}
        unit="celsius"
        updatedAt="10:30 AM"
      />,
    );

    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('Mainly clear')).toBeInTheDocument();

    rerender(
      <CurrentWeather
        current={mockCurrent}
        location={mockLocation}
        unit="fahrenheit"
        updatedAt="10:30 AM"
      />,
    );

    // 18C = 64F
    expect(screen.getByText('64°')).toBeInTheDocument();
  });

  it('renders atmospheric details like humidity, wind, UV index', () => {
    render(
      <CurrentWeather
        current={mockCurrent}
        location={mockLocation}
        unit="celsius"
        updatedAt="10:30 AM"
      />,
    );

    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('15 km/h')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });
});
