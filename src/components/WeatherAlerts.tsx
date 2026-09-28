import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, Wind, Zap } from 'lucide-react';
import { AirQualityData, CurrentWeather, Unit } from '../types/weather';
import { formatWind } from '../utils/formatters';

export interface WeatherAlert {
  id: string;
  severity: 'hazard' | 'warning' | 'advisory';
  title: string;
  description: string;
  safetyTips: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface WeatherAlertsProps {
  current: CurrentWeather;
  airQuality?: AirQualityData | null;
  unit: Unit;
}

export function computeWeatherAlerts(
  current: CurrentWeather,
  airQuality?: AirQualityData | null,
  unit: Unit = 'celsius',
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // 1. Extreme / Severe Thunderstorm
  if ([95, 96, 99].includes(current.conditionCode)) {
    alerts.push({
      id: 'thunderstorm',
      severity: 'hazard',
      title: 'Active Thunderstorm Warning',
      description: 'Severe thunderstorm conditions with high lightning and localized heavy rainfall detected.',
      safetyTips: ['Stay indoors away from windows', 'Unplug sensitive electronics', 'Avoid open fields and water bodies'],
      icon: Zap,
    });
  }

  // 2. High UV Index Hazard
  if (current.uvIndex >= 8) {
    alerts.push({
      id: 'uv-hazard',
      severity: current.uvIndex >= 11 ? 'hazard' : 'warning',
      title: `High UV Radiation Index (${current.uvIndex})`,
      description: 'Very high solar UV radiation levels. Unprotected skin and eyes can burn rapidly.',
      safetyTips: [
        'Apply SPF 50+ broad spectrum sunscreen',
        'Wear UV-rated sunglasses and a protective hat',
        'Seek shade during midday hours (10 AM – 4 PM)',
      ],
      icon: ShieldAlert,
    });
  }

  // 3. High Wind Advisory
  if (current.windSpeed >= 45) {
    alerts.push({
      id: 'wind-advisory',
      severity: current.windSpeed >= 65 ? 'hazard' : 'warning',
      title: `High Wind Advisory (${formatWind(current.windSpeed, unit)})`,
      description: 'Strong sustained wind speeds and gusts may cause hazardous outdoor conditions.',
      safetyTips: ['Secure loose outdoor objects and furniture', 'Exercise caution while driving high-profile vehicles'],
      icon: Wind,
    });
  }

  // 4. Hazardous Air Quality Alert
  if (airQuality && (airQuality.europeanAqi >= 60 || airQuality.pm25 >= 35)) {
    alerts.push({
      id: 'aqi-alert',
      severity: airQuality.europeanAqi >= 80 ? 'hazard' : 'warning',
      title: `Air Quality Alert (EAQI ${airQuality.europeanAqi} • PM2.5 ${airQuality.pm25} µg/m³)`,
      description: 'Elevated atmospheric particulate matter and ozone levels may impact respiratory health.',
      safetyTips: [
        'Sensitive groups should reduce strenuous outdoor exertion',
        'Keep windows closed during peak pollution hours',
        'Consider wearing an N95 mask outdoors',
      ],
      icon: AlertTriangle,
    });
  }

  return alerts;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ current, airQuality, unit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const alerts = computeWeatherAlerts(current, airQuality, unit).filter((a) => !dismissedIds.includes(a.id));

  if (alerts.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const dismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-2.5">
      {alerts.map((alert) => {
        const IconComponent = alert.icon;
        const isExpanded = expandedId === alert.id;
        const isHazard = alert.severity === 'hazard';

        const colorClasses = isHazard
          ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-200'
          : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-200';

        const badgeClasses = isHazard
          ? 'bg-rose-500 text-white'
          : 'bg-amber-500 text-white';

        return (
          <div
            key={alert.id}
            onClick={() => toggleExpand(alert.id)}
            className={`rounded-2xl border p-4 cursor-pointer transition-all shadow-xs ${colorClasses}`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-xs shrink-0">
                  <IconComponent className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClasses}`}>
                      {alert.severity}
                    </span>
                    <h4 className="text-sm font-bold tracking-tight">{alert.title}</h4>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">{alert.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => dismissAlert(alert.id, e)}
                  className="text-xs opacity-60 hover:opacity-100 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Dismiss alert"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label={isExpanded ? 'Collapse advisory details' : 'Expand advisory details'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-current/10 text-xs space-y-1.5 animate-fade-in">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended Safety Actions:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 opacity-90">
                  {alert.safetyTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
