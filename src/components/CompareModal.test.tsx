import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { Location, WeatherData } from '../types/weather';
import { CompareModal } from './CompareModal';

const mockBaseLocation: Location = {
  name: 'San Francisco',
  country: 'United States',
  latitude: 37.7749,
  longitude: -122.4194,
};

const mockBaseWeather: WeatherData = {
  location: mockBaseLocation,
  current: {
    temp: 16,
    feelsLike: 15,
    condition: 'Partly cloudy',
    conditionCode: 2,
    high: 19,
    low: 12,
    humidity: 72,
    windSpeed: 18,
    windDirection: 250,
    uvIndex: 5,
    precipitation: 0,
    isDay: true,
  },
  hourly: [],
  daily: [],
  updatedAt: '1:00 PM',
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CompareModal component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = renderWithQuery(
      <CompareModal
        isOpen={false}
        onClose={() => {}}
        baseLocation={mockBaseLocation}
        baseWeather={mockBaseWeather}
        unit="celsius"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders side-by-side comparison modal with primary city data', () => {
    renderWithQuery(
      <CompareModal
        isOpen={true}
        onClose={() => {}}
        baseLocation={mockBaseLocation}
        baseWeather={mockBaseWeather}
        unit="celsius"
      />,
    );

    expect(screen.getByText(/Multi-City Weather Comparison/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'San Francisco' })).toBeInTheDocument();
    expect(screen.getByText('16°')).toBeInTheDocument();
    expect(screen.getByText(/72%/)).toBeInTheDocument();
  });
});
