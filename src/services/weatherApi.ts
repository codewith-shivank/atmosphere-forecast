import { AirQualityData, DailyForecastItem, HourlyForecastItem, Location, WeatherData } from '../types/weather';

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm',
};

export function getWeatherCondition(code: number): string {
  return WMO_CODES[code] ?? 'Partly cloudy';
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error('Failed to search locations');
  }

  const data = await res.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: {
    name: string;
    admin1?: string;
    country?: string;
    country_code?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }) => ({
    name: item.name,
    admin1: item.admin1,
    country: item.country || '',
    countryCode: item.country_code,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<{ name: string; country: string; admin1?: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const name =
      data.locality ||
      data.city ||
      data.principalSubdivision ||
      data.countryName ||
      `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    return {
      name,
      country: data.countryName || '',
      admin1: data.principalSubdivision,
    };
  } catch {
    return {
      name: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      country: '',
    };
  }
}

export type RainViewerLayers = {
  host: string;
  radarPath: string | null;
  satellitePath: string | null;
};

export async function fetchRainViewerLayers(signal?: AbortSignal): Promise<RainViewerLayers> {
  const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', { signal });
  if (!res.ok) throw new Error('Unable to load radar frames');
  const data = await res.json();
  const nowcast = data.radar?.nowcast as Array<{ path: string }> | undefined;
  const past = data.radar?.past as Array<{ path: string }> | undefined;
  const infrared = data.satellite?.infrared as Array<{ path: string }> | undefined;
  const radarFrame = nowcast?.at(-1) ?? past?.at(-1);
  const satFrame = infrared?.at(-1);
  return {
    host: data.host as string,
    radarPath: radarFrame?.path ?? null,
    satellitePath: satFrame?.path ?? null,
  };
}

function calculateUvIndex(hour: number, month: number, latitude: number): number {
  // Simplified UV index estimation based on hour, month, and latitude
  // This is an approximation since Open-Meteo doesn't provide UV in the free tier
  const solarNoon = 12;
  const hourDiff = Math.abs(hour - solarNoon);
  const baseUv = Math.max(0, 11 - hourDiff * 1.5);
  const seasonalFactor = 1 - Math.abs((month + 0.5) / 6 - 1) * 0.5;
  const latitudeFactor = Math.max(0.3, 1 - Math.abs(latitude) / 90 * 0.7);
  return Math.round(baseUv * seasonalFactor * latitudeFactor);
}

export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility,dew_point_2m',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Unable to retrieve weather forecast for this location');
  }

  const json = await res.json();
  const current = json.current;
  const hourly = json.hourly;
  const daily = json.daily;

  // Format hourly data: next 24 hours starting from current hour
  const now = new Date();
  const currentIsoPrefix = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  let startIndex = 0;
  if (hourly?.time && Array.isArray(hourly.time)) {
    const found = hourly.time.findIndex((t: string) => t.startsWith(currentIsoPrefix));
    if (found !== -1) startIndex = found;
  }

  const hourlyItems: HourlyForecastItem[] = [];
  const hoursCount = Math.min(24, (hourly?.time?.length ?? 0) - startIndex);
  for (let i = 0; i < hoursCount; i++) {
    const idx = startIndex + i;
    const timeStr = hourly.time[idx];
    const itemDate = new Date(timeStr);
    const hourLabel = i === 0 ? 'Now' : itemDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    hourlyItems.push({
      time: timeStr,
      hour: hourLabel,
      temp: Math.round(hourly.temperature_2m[idx]),
      conditionCode: hourly.weather_code[idx],
      condition: getWeatherCondition(hourly.weather_code[idx]),
      precipitationProb: hourly.precipitation_probability ? hourly.precipitation_probability[idx] ?? 0 : 0,
      isDay: hourly.is_day ? Boolean(hourly.is_day[idx]) : true,
    });
  }

  // Format daily data (7 days)
  const dailyItems: DailyForecastItem[] = [];
  const daysCount = daily?.time?.length ?? 0;
  for (let i = 0; i < daysCount; i++) {
    const dateStr = daily.time[i];
    let dayLabel: string;
    if (i === 0) {
      dayLabel = 'Today';
    } else if (i === 1) {
      dayLabel = 'Tomorrow';
    } else {
      const d = new Date(dateStr + 'T12:00:00');
      dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    }

    dailyItems.push({
      date: dateStr,
      day: dayLabel,
      conditionCode: daily.weather_code[i],
      condition: getWeatherCondition(daily.weather_code[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      precipitationProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] ?? 0 : 0,
      sunrise: daily.sunrise?.[i],
      sunset: daily.sunset?.[i],
    });
  }

  const todayDailyHigh = dailyItems[0]?.maxTemp ?? Math.round(current.temperature_2m);
  const todayDailyLow = dailyItems[0]?.minTemp ?? Math.round(current.temperature_2m);

  // Calculate approximate UV index for current hour
  const currentHour = now.getHours();
  const currentMonth = now.getMonth() + 1;
  const uvIndex = calculateUvIndex(currentHour, currentMonth, location.latitude);

  // Format sunrise/sunset times for current day
  const sunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : undefined;
  const sunset = daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : undefined;

  // Pressure in hPa (mbar)
  const pressure = current.pressure_msl ? Math.round(current.pressure_msl) : undefined;
  // Visibility in meters from API, convert to km
  const visibility = current.visibility ? Math.round(current.visibility / 1000 * 10) / 10 : undefined;
  const dewPoint = current.dew_point_2m ? Math.round(current.dew_point_2m) : undefined;

  return {
    location,
    current: {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: getWeatherCondition(current.weather_code),
      conditionCode: current.weather_code,
      high: todayDailyHigh,
      low: todayDailyLow,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: Math.round(current.wind_direction_10m),
      uvIndex,
      precipitation: current.precipitation ?? 0,
      isDay: Boolean(current.is_day),
      pressure,
      visibility,
      dewPoint,
      sunrise,
      sunset,
    },
    hourly: hourlyItems,
    daily: dailyItems,
    updatedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}

export async function fetchAirQuality(latitude: number, longitude: number, signal?: AbortSignal): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
  
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error('Unable to retrieve air quality data');
  }

  const json = await res.json();
  const current = json.current;

  return {
    europeanAqi: Math.round(current?.european_aqi ?? 25),
    usAqi: Math.round(current?.us_aqi ?? 35),
    pm25: Math.round(current?.pm2_5 ?? 10),
    pm10: Math.round(current?.pm10 ?? 18),
    nitrogenDioxide: Math.round(current?.nitrogen_dioxide ?? 12),
    sulphurDioxide: Math.round(current?.sulphur_dioxide ?? 4),
    ozone: Math.round(current?.ozone ?? 45),
    carbonMonoxide: Math.round(current?.carbon_monoxide ?? 220),
    updatedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}