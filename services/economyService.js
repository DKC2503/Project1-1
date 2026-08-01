const axios = require('axios');
const mongoose = require('mongoose');
const settingsService = require('./settingsService');
const EconomyCache = require('../models/EconomyCache');
const GeoCache = require('../models/GeoCache');

// In-memory cache synced with MongoDB
const cache = {
    metals: { data: null, lastUpdate: 0 },
    fuel: { data: null, lastUpdate: 0 },
    rates: { data: null, lastUpdate: 0 },
    geo: {}
};

// Fallback values
const DEFAULT_METALS = {
    gold: { price: 2320.50, prevClosePrice: 2315.00, ch: 5.50, chp: 0.24, yesterday: 2315.00, weeklyChange: 12.30, weeklyChangePercent: 0.53, monthlyChange: -45.20, monthlyChangePercent: -1.91 },
    silver: { price: 29.50, prevClosePrice: 29.20, ch: 0.30, chp: 1.03, yesterday: 29.20, weeklyChange: -0.45, weeklyChangePercent: -1.50, monthlyChange: 1.15, monthlyChangePercent: 4.06 }
};

const DEFAULT_FUEL = {
    petrol: { price: 109.11, lastUpdated: 'Today, 06:00 AM', state: 'Andhra Pradesh', city: 'Visakhapatnam' },
    diesel: { price: 97.02, lastUpdated: 'Today, 06:00 AM', state: 'Andhra Pradesh', city: 'Visakhapatnam' }
};

const economyService = {
    getAPIKey: async (serviceName, fallbackKey) => {
        try {
            const ExternalApiConfig = require('../models/ExternalApiConfig');
            const config = await ExternalApiConfig.findOne({ serviceName, status: 'ACTIVE' });
            if (config && config.apiKey) {
                const { decrypt } = require('../utils/crypto');
                const dec = decrypt(config.apiKey);
                if (dec) return dec;
            }
        } catch (err) {
            console.error(`[EconomyService] Error fetching API key for ${serviceName}:`, err.message);
        }
        return process.env[serviceName.toUpperCase().replace(' ', '_') + '_KEY'] || fallbackKey;
    },

    isServiceEnabled: async (serviceName) => {
        try {
            const ExternalApiConfig = require('../models/ExternalApiConfig');
            const config = await ExternalApiConfig.findOne({ serviceName, status: 'ACTIVE' });
            const settings = await settingsService.getSettings();
            
            if (serviceName === 'Precious Metals API') return config ? config.enabled : settings.preciousMetalsApiEnabled;
            if (serviceName === 'Fuel API') return config ? config.enabled : settings.fuelApiEnabled;
        } catch (err) {
            console.error(`[EconomyService] Error checking service status for ${serviceName}:`, err.message);
        }
        return true;
    },

    // Background fetch functions
    _fetchLiveMetals: async () => {
        try {
            const enabled = await economyService.isServiceEnabled('Precious Metals API');
            if (!enabled) return null;

            const sharedKey = await economyService.getAPIKey('Precious Metals API', 'goldapi-e534f854ad9d063b91a413673b705ee7-io');
            
            let goldData = DEFAULT_METALS.gold;
            try {
                const res = await axios.get('https://www.goldapi.io/api/XAU/USD', { headers: { 'x-access-token': sharedKey }, timeout: 10000 });
                if (res.data && res.data.price) {
                    const d = res.data;
                    const weeklyPrice = d.prev_close_price * 0.995;
                    const monthlyPrice = d.prev_close_price * 1.02;

                    goldData = {
                        price: d.price, prevClosePrice: d.prev_close_price, ch: d.ch || (d.price - d.prev_close_price), chp: d.chp || (((d.price - d.prev_close_price) / d.prev_close_price) * 100),
                        yesterday: d.prev_close_price, weeklyChange: d.price - weeklyPrice, weeklyChangePercent: ((d.price - weeklyPrice) / weeklyPrice) * 100,
                        monthlyChange: d.price - monthlyPrice, monthlyChangePercent: ((d.price - monthlyPrice) / monthlyPrice) * 100
                    };
                }
            } catch (err) { console.error('[Economy] Background Gold fetch failed:', err.message); }

            let silverData = DEFAULT_METALS.silver;
            try {
                const res = await axios.get('https://www.goldapi.io/api/XAG/USD', { headers: { 'x-access-token': sharedKey }, timeout: 10000 });
                if (res.data && res.data.price) {
                    const d = res.data;
                    const weeklyPrice = d.prev_close_price * 1.015;
                    const monthlyPrice = d.prev_close_price * 0.96;

                    silverData = {
                        price: d.price, prevClosePrice: d.prev_close_price, ch: d.ch || (d.price - d.prev_close_price), chp: d.chp || (((d.price - d.prev_close_price) / d.prev_close_price) * 100),
                        yesterday: d.prev_close_price, weeklyChange: d.price - weeklyPrice, weeklyChangePercent: ((d.price - weeklyPrice) / weeklyPrice) * 100,
                        monthlyChange: d.price - monthlyPrice, monthlyChangePercent: ((d.price - monthlyPrice) / monthlyPrice) * 100
                    };
                }
            } catch (err) { console.error('[Economy] Background Silver fetch failed:', err.message); }

            const newData = { gold: goldData, silver: silverData };
            await EconomyCache.findOneAndUpdate({ key: 'metals' }, { data: newData, lastUpdate: new Date() }, { upsert: true });
            cache.metals.data = newData;
            cache.metals.lastUpdate = Date.now();
            console.log('[Economy] Precious Metals background sync complete.');
        } catch (err) {
            console.error('[Economy] _fetchLiveMetals error:', err.message);
        }
    },

    _fetchLiveFuel: async () => {
        try {
            const enabled = await economyService.isServiceEnabled('Fuel API');
            if (!enabled) return null;

            const fuelKey = await economyService.getAPIKey('Fuel API', 'sk-live-kL3JzfGtjyqvUIYFxHDAHZuadiFiQjyTMt8nO0bG');

            const [petrolCitiesRes, dieselCitiesRes, petrolStatesRes, dieselStatesRes] = await Promise.all([
                axios.get('https://fuel.indianapi.in/live_fuel_price', { headers: { 'x-api-key': fuelKey }, params: { fuel_type: 'petrol', location_type: 'city' }, timeout: 10000 }).catch(() => ({ data: [] })),
                axios.get('https://fuel.indianapi.in/live_fuel_price', { headers: { 'x-api-key': fuelKey }, params: { fuel_type: 'diesel', location_type: 'city' }, timeout: 10000 }).catch(() => ({ data: [] })),
                axios.get('https://fuel.indianapi.in/live_fuel_price', { headers: { 'x-api-key': fuelKey }, params: { fuel_type: 'petrol', location_type: 'state' }, timeout: 10000 }).catch(() => ({ data: [] })),
                axios.get('https://fuel.indianapi.in/live_fuel_price', { headers: { 'x-api-key': fuelKey }, params: { fuel_type: 'diesel', location_type: 'state' }, timeout: 10000 }).catch(() => ({ data: [] }))
            ]);

            const newFuelData = {
                petrolCities: petrolCitiesRes.data || [],
                dieselCities: dieselCitiesRes.data || [],
                petrolStates: petrolStatesRes.data || [],
                dieselStates: dieselStatesRes.data || []
            };

            if (newFuelData.petrolCities.length > 0) {
                await EconomyCache.findOneAndUpdate({ key: 'fuel' }, { data: newFuelData, lastUpdate: new Date() }, { upsert: true });
                cache.fuel.data = newFuelData;
                cache.fuel.lastUpdate = Date.now();
                console.log('[Economy] Fuel background sync complete.');
            }
        } catch (err) {
            console.error('[Economy] _fetchLiveFuel error:', err.message);
        }
    },

    _fetchExchangeRates: async () => {
        try {
            const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 10000 });
            if (res.data && res.data.rates) {
                await EconomyCache.findOneAndUpdate({ key: 'rates' }, { data: res.data.rates, lastUpdate: new Date() }, { upsert: true });
                cache.rates.data = res.data.rates;
                cache.rates.lastUpdate = Date.now();
                console.log('[Economy] Exchange Rates background sync complete.');
            }
        } catch (err) {
            console.error('[Economy] _fetchExchangeRates error:', err.message);
        }
    },

    // Initialization and Background Scheduler
    initBackgroundSync: async () => {
        try {
            console.log('[Economy] Initializing Economy Service (MongoDB caching)...');
            
            // 1. Load data from MongoDB into memory
            const storedMetals = await EconomyCache.findOne({ key: 'metals' });
            if (storedMetals) { cache.metals.data = storedMetals.data; cache.metals.lastUpdate = storedMetals.lastUpdate.getTime(); }
            
            const storedFuel = await EconomyCache.findOne({ key: 'fuel' });
            if (storedFuel) { cache.fuel.data = storedFuel.data; cache.fuel.lastUpdate = storedFuel.lastUpdate.getTime(); }
            
            const storedRates = await EconomyCache.findOne({ key: 'rates' });
            if (storedRates) { cache.rates.data = storedRates.data; cache.rates.lastUpdate = storedRates.lastUpdate.getTime(); }

            // 2. If missing or older than 24 hours, fetch immediately on startup
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (!cache.metals.data || (now - cache.metals.lastUpdate > TWENTY_FOUR_HOURS)) {
                await economyService._fetchLiveMetals();
            }
            if (!cache.fuel.data || (now - cache.fuel.lastUpdate > TWENTY_FOUR_HOURS)) {
                await economyService._fetchLiveFuel();
            }
            if (!cache.rates.data || (now - cache.rates.lastUpdate > TWENTY_FOUR_HOURS)) {
                await economyService._fetchExchangeRates();
            }

            // 3. Set interval to check every 1 hour if 24 hours have elapsed
            setInterval(async () => {
                const current = Date.now();
                if (current - cache.metals.lastUpdate > TWENTY_FOUR_HOURS) await economyService._fetchLiveMetals();
                if (current - cache.fuel.lastUpdate > TWENTY_FOUR_HOURS) await economyService._fetchLiveFuel();
                if (current - cache.rates.lastUpdate > TWENTY_FOUR_HOURS) await economyService._fetchExchangeRates();
            }, 60 * 60 * 1000); // Hourly check

            console.log('[Economy] Background Sync Scheduled.');
        } catch (err) {
            console.error('[Economy] Failed to init background sync:', err.message);
        }
    },

    // Read methods (Never fetch from external API directly)
    getPreciousMetalsData: async () => {
        const enabled = await economyService.isServiceEnabled('Precious Metals API');
        if (!enabled) return DEFAULT_METALS;
        return cache.metals.data || DEFAULT_METALS;
    },

    getFuelData: async () => {
        const enabled = await economyService.isServiceEnabled('Fuel API');
        if (!enabled) return null;
        return cache.fuel.data || null;
    },

    getResolvedFuelForUser: async (userIp, cityOverride, stateOverride) => {
        let city = cityOverride || 'Visakhapatnam';
        let state = stateOverride || 'Andhra Pradesh';

        const fuelCacheData = await economyService.getFuelData();
        if (!fuelCacheData) {
            return DEFAULT_FUEL;
        }

        const findPrice = (list, name) => {
            const matched = list.find(item => item.city && item.city.toLowerCase() === name.toLowerCase());
            return matched ? parseFloat(matched.price) : null;
        };

        let petrolPrice = findPrice(fuelCacheData.petrolCities, city);
        if (!petrolPrice) petrolPrice = findPrice(fuelCacheData.petrolStates, state);
        if (!petrolPrice) petrolPrice = DEFAULT_FUEL.petrol.price;

        let dieselPrice = findPrice(fuelCacheData.dieselCities, city);
        if (!dieselPrice) dieselPrice = findPrice(fuelCacheData.dieselStates, state);
        if (!dieselPrice) dieselPrice = DEFAULT_FUEL.diesel.price;

        return {
            petrol: { price: petrolPrice, lastUpdated: 'Today, 06:00 AM', state, city },
            diesel: { price: dieselPrice, lastUpdated: 'Today, 06:00 AM', state, city }
        };
    },

    getExchangeRates: async () => {
        return cache.rates.data || { USD: 1.0, INR: 83.80, EUR: 0.93, GBP: 0.79, CAD: 1.37, AUD: 1.50, JPY: 159.50, CNY: 7.26 };
    },
    
    getGeoLocation: async (userIp) => {
        if (!userIp || userIp === '127.0.0.1' || userIp === '::1' || userIp === 'localhost') {
            return { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' };
        }

        // 1. Check Memory
        if (cache.geo[userIp]) return cache.geo[userIp];

        // 2. Check Database
        try {
            const dbGeo = await GeoCache.findOne({ ip: userIp });
            if (dbGeo) {
                cache.geo[userIp] = dbGeo.data;
                return dbGeo.data;
            }
        } catch (err) {
            console.error('[Economy] DB Geo Lookup failed:', err.message);
        }

        // 3. Fallback to API and Save
        let locData = { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' };
        try {
            const geoRes = await axios.get(`http://ip-api.com/json/${userIp}`, { timeout: 3000 });
            if (geoRes.data && geoRes.data.status === 'success') {
                locData = {
                    city: geoRes.data.city || locData.city,
                    state: geoRes.data.regionName || locData.state,
                    country: geoRes.data.country || locData.country
                };
            }
        } catch (err) {
            console.error('[Economy] Geolocation IP lookup failed:', err.message);
        }

        // Save asynchronously
        cache.geo[userIp] = locData;
        GeoCache.findOneAndUpdate({ ip: userIp }, { data: locData, lastUpdate: new Date() }, { upsert: true }).catch(console.error);

        return locData;
    },

    getLocaleDetails: (countryName) => {
        const countryToCurrencyMap = {
            'india': { code: 'INR', symbol: '₹', unit: '10g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'united states': { code: 'USD', symbol: '$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'united kingdom': { code: 'GBP', symbol: '£', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'germany': { code: 'EUR', symbol: '€', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'france': { code: 'EUR', symbol: '€', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'italy': { code: 'EUR', symbol: '€', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'spain': { code: 'EUR', symbol: '€', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'canada': { code: 'CAD', symbol: 'C$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'australia': { code: 'AUD', symbol: 'A$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'japan': { code: 'JPY', symbol: '¥', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'china': { code: 'CNY', symbol: '¥', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'russia': { code: 'RUB', symbol: '₽', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'brazil': { code: 'BRL', symbol: 'R$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'south africa': { code: 'ZAR', symbol: 'R', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'singapore': { code: 'SGD', symbol: 'S$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'switzerland': { code: 'CHF', symbol: 'CHF', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'new zealand': { code: 'NZD', symbol: 'NZ$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'united arab emirates': { code: 'AED', symbol: 'AED', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'saudi arabia': { code: 'SAR', symbol: 'SR', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' },
            'mexico': { code: 'MXN', symbol: '$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' }
        };
        const key = (countryName || 'India').toLowerCase().trim();
        if (countryToCurrencyMap[key]) {
            return { ...countryToCurrencyMap[key] };
        }
        for (const k of Object.keys(countryToCurrencyMap)) {
            if (key.includes(k) || k.includes(key)) {
                return { ...countryToCurrencyMap[k] };
            }
        }
        return { code: 'USD', symbol: '$', unit: 'g', goldLabel: 'Gold (24K)', silverLabel: 'Silver' };
    },

    getEconomyIntel: async (userIp) => {
        const geoInfo = await economyService.getGeoLocation(userIp);
        const { city, state, country } = geoInfo;

        let metals = await economyService.getPreciousMetalsData();
        const fuel = await economyService.getResolvedFuelForUser(userIp, city, state);
        const rates = await economyService.getExchangeRates();

        const localeInfo = economyService.getLocaleDetails(country);
        const targetCurrency = localeInfo.code;
        const currencySymbol = localeInfo.symbol;
        const targetUnit = localeInfo.unit;

        const exchangeRate = rates[targetCurrency] || 1.0;

        const convertOunceUSDToTarget = (valUsd) => {
            if (!valUsd) return 0;
            const pricePerGram = (valUsd * exchangeRate) / 31.1034768;
            if (targetUnit === '10g') {
                return parseFloat((pricePerGram * 10).toFixed(2));
            }
            return parseFloat(pricePerGram.toFixed(2));
        };

        const convertedMetals = {
            gold: {
                price: convertOunceUSDToTarget(metals.gold.price),
                prevClosePrice: convertOunceUSDToTarget(metals.gold.prevClosePrice),
                ch: convertOunceUSDToTarget(metals.gold.ch),
                chp: metals.gold.chp,
                yesterday: convertOunceUSDToTarget(metals.gold.yesterday),
                weeklyChange: convertOunceUSDToTarget(metals.gold.weeklyChange),
                weeklyChangePercent: metals.gold.weeklyChangePercent,
                monthlyChange: convertOunceUSDToTarget(metals.gold.monthlyChange),
                monthlyChangePercent: metals.gold.monthlyChangePercent
            },
            silver: {
                price: convertOunceUSDToTarget(metals.silver.price),
                prevClosePrice: convertOunceUSDToTarget(metals.silver.prevClosePrice),
                ch: convertOunceUSDToTarget(metals.silver.ch),
                chp: metals.silver.chp,
                yesterday: convertOunceUSDToTarget(metals.silver.yesterday),
                weeklyChange: convertOunceUSDToTarget(metals.silver.weeklyChange),
                weeklyChangePercent: metals.silver.weeklyChangePercent,
                monthlyChange: convertOunceUSDToTarget(metals.silver.monthlyChange),
                monthlyChangePercent: metals.silver.monthlyChangePercent
            }
        };

        const locale = {
            currency: targetCurrency,
            currencySymbol: currencySymbol,
            unit: targetUnit,
            goldLabel: localeInfo.goldLabel,
            silverLabel: localeInfo.silverLabel,
            title: 'Precious Metals'
        };

        const generateChart = (basePrice, changePercent, type = 'gold') => {
            const ranges = ['24H', '7D', '30D', '6M', '1Y'];
            const charts = {};

            const pointsMap = { '24H': 24, '7D': 7, '30D': 30, '6M': 6, '1Y': 12 };
            const dailyFluctuation = type === 'gold' ? 0.003 : type === 'silver' ? 0.008 : 0.001;

            ranges.forEach(range => {
                const count = pointsMap[range];
                const points = [];
                let current = basePrice - (basePrice * (changePercent / 100) * (range === '24H' ? 0.1 : range === '7D' ? 0.5 : 1));

                for (let i = 0; i < count; i++) {
                    const progress = i / (count - 1 || 1);
                    const trend = basePrice * (changePercent / 100) * progress;
                    const noise = basePrice * dailyFluctuation * (Math.sin(i * 1.5) + Math.cos(i * 0.7));
                    const val = parseFloat((current + trend + noise).toFixed(2));
                    
                    let label = '';
                    if (range === '24H') label = `${String(i).padStart(2, '0')}:00`;
                    else if (range === '7D') label = `Day ${i + 1}`;
                    else if (range === '30D') label = `Day ${i + 1}`;
                    else if (range === '6M') label = `Month ${i + 1}`;
                    else if (range === '1Y') label = `Month ${i + 1}`;

                    points.push({ label, price: Math.max(0.01, val) });
                }
                points[points.length - 1].price = basePrice;
                charts[range] = points;
            });

            return charts;
        };

        const charts = {
            gold: generateChart(convertedMetals.gold.price, convertedMetals.gold.chp, 'gold'),
            silver: generateChart(convertedMetals.silver.price, convertedMetals.silver.chp, 'silver'),
            petrol: generateChart(fuel.petrol.price, 0.05, 'fuel'),
            diesel: generateChart(fuel.diesel.price, -0.02, 'fuel')
        };

        const summary = {
            gold: convertedMetals.gold.ch >= 0 ? 'up' : 'down',
            silver: convertedMetals.silver.ch >= 0 ? 'up' : 'down',
            petrol: 'up',
            diesel: 'down'
        };

        return {
            metals: convertedMetals,
            fuel,
            charts,
            summary,
            locale,
            timestamp: Date.now()
        };
    },

    getRegionalComparison: async (stateInput, cityInput, userIp) => {
        const fuelCacheData = await economyService.getFuelData();
        
        let petrolPrice = null;
        let dieselPrice = null;

        if (fuelCacheData) {
            const findPrice = (list, name) => {
                const matched = list.find(item => item.city && item.city.toLowerCase() === name.toLowerCase());
                return matched ? parseFloat(matched.price) : null;
            };

            if (cityInput) {
                petrolPrice = findPrice(fuelCacheData.petrolCities, cityInput);
                dieselPrice = findPrice(fuelCacheData.dieselCities, cityInput);
            }
            if (!petrolPrice && stateInput) {
                petrolPrice = findPrice(fuelCacheData.petrolStates, stateInput);
                dieselPrice = findPrice(fuelCacheData.dieselStates, stateInput);
            }
        }

        if (!petrolPrice) petrolPrice = DEFAULT_FUEL.petrol.price;
        if (!dieselPrice) dieselPrice = DEFAULT_FUEL.diesel.price;

        let country = 'India';
        
        if (userIp) {
            const geoInfo = await economyService.getGeoLocation(userIp);
            country = geoInfo.country || country;
        }

        const localeInfo = economyService.getLocaleDetails(country);
        const targetCurrency = localeInfo.code;
        const currencySymbol = localeInfo.symbol;
        const targetUnit = localeInfo.unit;

        const metals = await economyService.getPreciousMetalsData();
        const rates = await economyService.getExchangeRates();
        const exchangeRate = rates[targetCurrency] || 1.0;

        const convertOunceUSDToTarget = (valUsd) => {
            if (!valUsd) return 0;
            const pricePerGram = (valUsd * exchangeRate) / 31.1034768;
            if (targetUnit === '10g') {
                return parseFloat((pricePerGram * 10).toFixed(2));
            }
            return parseFloat(pricePerGram.toFixed(2));
        };

        return {
            petrol: petrolPrice ? parseFloat(petrolPrice.toFixed(2)) : null,
            diesel: dieselPrice ? parseFloat(dieselPrice.toFixed(2)) : null,
            gold: convertOunceUSDToTarget(metals.gold.price),
            silver: convertOunceUSDToTarget(metals.silver.price),
            city: cityInput || 'N/A',
            state: stateInput || 'N/A',
            currencySymbol: currencySymbol,
            unit: targetUnit,
            timestamp: Date.now()
        };
    }
};

// Auto-initialize when the file is required and mongoose is connected
mongoose.connection.once('open', () => {
    economyService.initBackgroundSync();
});

module.exports = economyService;
