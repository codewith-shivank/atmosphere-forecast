import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Info, ShieldAlert, Wind } from 'lucide-react';
import { AirQualityData } from '../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData | null;
  loading?: boolean;
}

interface AqiConfig {
  label: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getAqiCategory(europeanAqi: number): AqiConfig {
  if (europeanAqi <= 20) {
    return {
      label: 'Good',
      description: 'Air quality is satisfactory and poses little or no risk.',
      color: 'text-emerald-500',
      bgLight: 'bg-emerald-500/10',
      borderLight: 'border-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle,
    };
  }
  if (europeanAqi <= 40) {
    return {
      label: 'Fair',
      description: 'Air quality is acceptable; moderate health concern for sensitive individuals.',
      color: 'text-sky-500',
      bgLight: 'bg-sky-500/10',
      borderLight: 'border-sky-500/30',
      textColor: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-700 dark:text-sky-300',
      icon: Info,
    };
  }
  if (europeanAqi <= 60) {
    return {
      label: 'Moderate',
      description: 'Sensitive groups may experience minor breathing discomfort.',
      color: 'text-amber-500',
      bgLight: 'bg-amber-500/10',
      borderLight: 'border-amber-500/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      icon: Activity,
    };
  }
  if (europeanAqi <= 80) {
    return {
      label: 'Poor',
      description: 'Everyone may begin to experience health effects.',
      color: 'text-orange-500',
      bgLight: 'bg-orange-500/10',
      borderLight: 'border-orange-500/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      icon: AlertTriangle,
    };
  }
  return {
    label: 'Very Poor',
    description: 'Health alert: serious risk of respiratory symptoms in general population.',
    color: 'text-rose-500',
    bgLight: 'bg-rose-500/10',
    borderLight: 'border-rose-500/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
    icon: ShieldAlert,
  };
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality, loading }) => {
  if (loading || !airQuality) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-950 animate-pulse">
        <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const aqiInfo = getAqiCategory(airQuality.europeanAqi);
  const StatusIcon = aqiInfo.icon;

  const pollutants = [
    { name: 'PM2.5', value: `${airQuality.pm25} µg/m³`, max: 50, current: airQuality.pm25, desc: 'Fine particles' },
    { name: 'PM10', value: `${airQuality.pm10} µg/m³`, max: 100, current: airQuality.pm10, desc: 'Coarse dust' },
    { name: 'Ozone (O₃)', value: `${airQuality.ozone} µg/m³`, max: 120, current: airQuality.ozone, desc: 'Ground level' },
    { name: 'NO₂', value: `${airQuality.nitrogenDioxide} µg/m³`, max: 90, current: airQuality.nitrogenDioxide, desc: 'Nitrogen dioxide' },
    { name: 'SO₂', value: `${airQuality.sulphurDioxide} µg/m³`, max: 50, current: airQuality.sulphurDioxide, desc: 'Sulphur dioxide' },
    { name: 'CO', value: `${airQuality.carbonMonoxide} µg/m³`, max: 1000, current: airQuality.carbonMonoxide, desc: 'Carbon monoxide' },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 transition-all">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Air Quality & Atmosphere Index
          </h3>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Updated {airQuality.updatedAt}
        </span>
      </div>

      {/* Main AQI Banner */}
      <div className={`rounded-xl p-4 border mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${aqiInfo.bgLight} ${aqiInfo.borderLight}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full bg-white dark:bg-zinc-900 shadow-xs ${aqiInfo.color}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {airQuality.europeanAqi}
              </span>
              <span className="text-xs uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400">
                EAQI Score
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${aqiInfo.badgeBg}`}>
                {aqiInfo.label}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {aqiInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">US AQI:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{airQuality.usAqi}</span>
        </div>
      </div>

      {/* Pollutant Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((item) => {
          const ratio = Math.min(100, Math.round((item.current / item.max) * 100));
          return (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {item.value}
                </div>
              </div>

              <div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ratio < 40 ? 'bg-emerald-500' : ratio < 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
