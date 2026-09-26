import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

const iconSizeMap: Record<string, number> = {
  'small': 16,
  'medium': 24,
  'large': 32,
  'xlarge': 48,
};

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  const strokeWidth = size && size > 32 ? 1.5 : 1.8;

  const iconProps = {
    className,
    size,
    strokeWidth,
  };

  // Clear Sky
  if (code === 0) {
    return isDay ? (
      <Sun {...iconProps} className={`${className} text-amber-500 dark:text-amber-400`} />
    ) : (
      <Moon {...iconProps} className={`${className} text-indigo-400 dark:text-indigo-300`} />
    );
  }

  // Mainly clear & partly cloudy
  if (code === 1 || code === 2) {
    return isDay ? (
      <CloudSun {...iconProps} className={`${className} text-amber-500 dark:text-amber-400`} />
    ) : (
      <CloudMoon {...iconProps} className={`${className} text-indigo-400 dark:text-indigo-300`} />
    );
  }

  // Overcast
  if (code === 3) {
    return <Cloud {...iconProps} className={`${className} text-zinc-500 dark:text-zinc-400`} />;
  }

  // Fog
  if (code === 45 || code === 48) {
    return <CloudFog {...iconProps} className={`${className} text-zinc-400 dark:text-zinc-500`} />;
  }

  // Drizzle
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle {...iconProps} className={`${className} text-sky-500 dark:text-sky-400`} />;
  }

  // Rain
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain {...iconProps} className={`${className} text-blue-500 dark:text-blue-400`} />;
  }

  // Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <CloudSnow {...iconProps} className={`${className} text-sky-400 dark:text-sky-300`} />;
  }

  // Thunderstorm
  if (code >= 95) {
    return <CloudLightning {...iconProps} className={`${className} text-amber-600 dark:text-amber-400`} />;
  }

  // Default
  return <Cloud {...iconProps} className={`${className} text-zinc-400 dark:text-zinc-500`} />;
};