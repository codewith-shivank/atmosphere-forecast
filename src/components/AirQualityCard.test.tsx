import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AirQualityData } from '../types/weather';
import { AirQualityCard } from './AirQualityCard';

const mockAirQuality: AirQualityData = {
  europeanAqi: 15,
  usAqi: 28,
  pm25: 8,
  pm10: 16,
  nitrogenDioxide: 10,
  sulphurDioxide: 3,
  ozone: 40,
  carbonMonoxide: 200,
  updatedAt: '12:00 PM',
};

describe('AirQualityCard component', () => {
  it('renders loading state properly', () => {
    const { container } = render(<AirQualityCard airQuality={null} loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders AQI score and Good status badge', () => {
    render(<AirQualityCard airQuality={mockAirQuality} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText(/Air quality is satisfactory/i)).toBeInTheDocument();
  });

  it('renders pollutant metrics list', () => {
    render(<AirQualityCard airQuality={mockAirQuality} />);
    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('8 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
    expect(screen.getByText('16 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('Ozone (O₃)')).toBeInTheDocument();
  });
});
