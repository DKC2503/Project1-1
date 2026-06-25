const axios = require('axios');
const settingsService = require('./settingsService');

const API_KEY = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || '71e7436123ba4731a9b191053261906';
const BASE_URL = process.env.WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1';

// In-memory cache for weather reports (keys are location queries, e.g. "london")
const weatherCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const weatherService = {
  getWeatherData: async (locationQuery = 'London') => {
    const ExternalApiConfig = require('../models/ExternalApiConfig');
    const activeConfig = await ExternalApiConfig.findOne({ serviceName: 'Weather API', status: 'ACTIVE' });
    
    const settings = await settingsService.getSettings();
    const isEnabled = activeConfig ? activeConfig.enabled : settings.weatherApiEnabled;
    if (!isEnabled) {
      return {
        success: false,
        source: 'disabled',
        message: 'Weather API is currently disabled by the administrator.',
        data: null
      };
    }

    const query = locationQuery.trim().toLowerCase();
    const now = Date.now();

    if (weatherCache[query]) {
      const entry = weatherCache[query];
      const isExpired = now - entry.timestamp >= CACHE_DURATION;
      if (isExpired && !entry.isRefreshing) {
        entry.isRefreshing = true;
        weatherService.refreshInBackground(locationQuery).catch(err => {
          console.error(`[WeatherService] Background refresh error for ${locationQuery}:`, err.message);
        }).finally(() => {
          entry.isRefreshing = false;
        });
      }
      return {
        success: true,
        source: isExpired ? 'stale' : 'cache',
        data: entry.data,
        timestamp: entry.timestamp,
        message: isExpired ? 'Weather data temporarily unavailable' : undefined
      };
    }

    // No cache yet (initial load), fetch synchronously
    try {
      const data = await weatherService.fetchFromAPI(locationQuery);
      weatherCache[query] = {
        data,
        timestamp: now,
        isRefreshing: false
      };
      return {
        success: true,
        source: 'api',
        data,
        timestamp: now
      };
    } catch (err) {
      console.error(`[WeatherService] Initial fetch error for ${locationQuery}:`, err.message);
      return {
        success: false,
        source: 'error',
        message: 'Weather data temporarily unavailable',
        data: null
      };
    }
  },

  fetchFromAPI: async (locationQuery) => {
    const ExternalApiConfig = require('../models/ExternalApiConfig');
    const activeConfig = await ExternalApiConfig.findOne({ serviceName: 'Weather API', status: 'ACTIVE' });
    
    const settings = await settingsService.getSettings();
    const isEnabled = activeConfig ? activeConfig.enabled : settings.weatherApiEnabled;
    if (!isEnabled) {
      throw new Error('Weather API is currently disabled by the administrator.');
    }
    
    let key = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || '71e7436123ba4731a9b191053261906';
    if (activeConfig && activeConfig.apiKey) {
      const { decrypt } = require('../utils/crypto');
      const decrypted = decrypt(activeConfig.apiKey);
      if (decrypted) key = decrypted;
    }

    const url = `${BASE_URL}/forecast.json?key=${key}&q=${locationQuery}&days=7&aqi=yes`;
    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    return {
      city: data.location.name,
      state: data.location.region,
      country: data.location.country,
      temp: Math.round(data.current.temp_c),
      feelsLike: Math.round(data.current.feelslike_c),
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      visibility: data.current.vis_km,
      pressure: data.current.pressure_mb,
      icon: data.current.condition.icon.startsWith('//') ? `https:${data.current.condition.icon}` : data.current.condition.icon,
      aqi: Math.round(data.current.air_quality ? data.current.air_quality['us-epa-index'] : 1),
      uvIndex: data.current.uv,
      cloudCover: data.current.cloud,
      dewPoint: Math.round(data.current.dewpoint_c || 0),
      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset,
      weekly: data.forecast.forecastday.map((day) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(day.day.maxtemp_c),
        low: Math.round(day.day.mintemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon.startsWith('//') ? `https:${day.day.condition.icon}` : day.day.condition.icon,
        rainProb: day.day.daily_chance_of_rain || 0,
        windSpeed: Math.round(day.day.maxwind_kph)
      })),
      hourly: data.forecast.forecastday[0].hour.slice(new Date().getHours(), new Date().getHours() + 12).map((h) => ({
        time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(h.temp_c),
        icon: h.condition.icon.startsWith('//') ? `https:${h.condition.icon}` : h.condition.icon
      })),
      timestamp: Date.now()
    };
  },

  refreshInBackground: async (locationQuery) => {
    const settings = await settingsService.getSettings();
    if (!settings.weatherApiEnabled) {
      console.log(`[WeatherService] Background refresh skipped: Weather API disabled.`);
      return;
    }
    console.log(`[WeatherService] Refreshing weather for ${locationQuery} in background...`);
    const query = locationQuery.trim().toLowerCase();
    const data = await weatherService.fetchFromAPI(locationQuery);
    if (weatherCache[query]) {
      weatherCache[query].data = data;
      weatherCache[query].timestamp = Date.now();
    }
    console.log(`[WeatherService] Background refresh complete for ${locationQuery}.`);
  }
};

module.exports = weatherService;
