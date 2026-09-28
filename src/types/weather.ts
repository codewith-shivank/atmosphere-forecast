export type Unit = 'celsius' | 'fahrenheit';

export interface Location {
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  precipitation: number;
  isDay: boolean;
  pressure?: number;
  visibility?: number;
  dewPoint?: number;
  sunrise?: string;
  sunset?: string;
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temp: number;
  conditionCode: number;
  condition: string;
  precipitationProb: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  day: string;
  conditionCode: number;
  condition: string;
  minTemp: number;
  maxTemp: number;
  precipitationProb: number;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  updatedAt: string;
}

export interface AirQualityData {
  europeanAqi: number;
  usAqi: number;
  pm25: number;
  pm10: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  ozone: number;
  carbonMonoxide: number;
  updatedAt: string;
}

export interface UnitConversion {
  temp: (celsius: number, unit: Unit) => number;
  wind: (kmh: number, unit: Unit) => number;
}
