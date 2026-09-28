import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HourlyForecastItem } from '../types/weather';
import { WeatherChart } from './WeatherChart';

const mockHourly: HourlyForecastItem[] = [
  { time: '2026-06-15T00:00', hour: '12 AM', temp: 15, conditionCode: 0, condition: 'Clear sky', precipitationProb: 0, isDay: false },
  { time: '2026-06-15T01:00', hour: '1 AM', temp: 14, conditionCode: 0, condition: 'Clear sky', precipitationProb: 5, isDay: false },
  { time: '2026-06-15T02:00', hour: '2 AM', temp: 13, conditionCode: 1, condition: 'Mainly clear', precipitationProb: 10, isDay: false },
  { time: '2026-06-15T03:00', hour: '3 AM', temp: 13, conditionCode: 2, condition: 'Partly cloudy', precipitationProb: 15, isDay: false },
  { time: '2026-06-15T04:00', hour: '4 AM', temp: 12, conditionCode: 3, condition: 'Overcast', precipitationProb: 20, isDay: false },
];

describe('WeatherChart component', () => {
  it('renders SVG chart title and elements', () => {
    const { container } = render(<WeatherChart items={mockHourly} unit="celsius" />);
    expect(screen.getByText(/Interactive 24-Hour Temperature Curve/i)).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles empty items without crashing', () => {
    const { container } = render(<WeatherChart items={[]} unit="celsius" />);
    expect(container.firstChild).toBeNull();
  });
});
