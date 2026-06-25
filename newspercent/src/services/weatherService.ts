import api from '../config/api';

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainProb: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
}

export interface WeatherData {
  city: string;
  state?: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;
  aqi: number;
  uvIndex: number;
  cloudCover: number;
  dewPoint: number;
  sunrise: string;
  sunset: string;
  weekly: WeatherForecast[];
  hourly: HourlyForecast[];
  timestamp: number;
  source: string;
  message?: string;
}

export const fetchWeather = async (lat?: number, lon?: number, query?: string): Promise<WeatherData | null> => {
  try {
    const params: any = {};
    if (query) {
      params.q = query;
    } else if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
    }

    const res = await api.get('/api/weather/report', { params });
    if (res.data && res.data.success) {
      return {
        ...res.data.data,
        source: res.data.source,
        message: res.data.message
      };
    }
    
    console.warn('[WeatherService] Backend returned error status:', res.data);
    return getFallbackWeather(query || 'London', res.data?.message || 'Weather data temporarily unavailable');
  } catch (error: any) {
    console.error('[WeatherService] Error fetching weather:', error.message);
    return getFallbackWeather(query || 'London', 'Weather data temporarily unavailable');
  }
};

const getFallbackWeather = (city: string, message: string): WeatherData => ({
  city,
  state: 'Unavailable',
  country: 'Unavailable',
  temp: 0,
  feelsLike: 0,
  condition: 'Unavailable',
  humidity: 0,
  windSpeed: 0,
  visibility: 0,
  pressure: 0,
  icon: '',
  aqi: 0,
  uvIndex: 0,
  cloudCover: 0,
  dewPoint: 0,
  sunrise: '--:--',
  sunset: '--:--',
  weekly: [],
  hourly: [],
  timestamp: Date.now(),
  source: 'error',
  message
});

export const getGeolocation = (): Promise<{ lat: number, lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
