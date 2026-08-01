import React from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  CloudFog, 
  CloudSun, 
  CloudMoon,
  Wind
} from 'lucide-react';

interface WeatherIconProps {
  iconUrl?: string;
  condition?: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ iconUrl = '', condition = '', className = 'w-6 h-6' }) => {
  const condLower = condition.toLowerCase();
  const iconLower = iconUrl.toLowerCase();
  const isNight = iconLower.includes('night') || iconLower.includes('moon');

  if (condLower.includes('lightning') || condLower.includes('thunder') || condLower.includes('storm')) {
    return <CloudLightning className={className} />;
  }
  if (condLower.includes('snow') || condLower.includes('sleet') || condLower.includes('hail') || condLower.includes('ice') || condLower.includes('blizzard')) {
    return <CloudSnow className={className} />;
  }
  if (condLower.includes('rain') || condLower.includes('shower')) {
    return <CloudRain className={className} />;
  }
  if (condLower.includes('drizzle') || condLower.includes('sprinkle') || condLower.includes('misty')) {
    return <CloudDrizzle className={className} />;
  }
  if (condLower.includes('fog') || condLower.includes('mist') || condLower.includes('haze') || condLower.includes('smoke') || condLower.includes('dust')) {
    return <CloudFog className={className} />;
  }
  if (condLower.includes('cloud') || condLower.includes('overcast')) {
    if (condLower.includes('partly') || condLower.includes('patchy') || condLower.includes('few')) {
      return isNight ? <CloudMoon className={className} /> : <CloudSun className={className} />;
    }
    return <Cloud className={className} />;
  }
  if (condLower.includes('wind') || condLower.includes('breeze') || condLower.includes('gale')) {
    return <Wind className={className} />;
  }
  if (condLower.includes('sunny') || condLower.includes('clear') || condLower.includes('hot')) {
    return isNight ? <Moon className={className} /> : <Sun className={className} />;
  }

  // Fallback based on night status in the icon url or default to sun/moon
  return isNight ? <Moon className={className} /> : <Sun className={className} />;
};

export default WeatherIcon;
