const axios = require('axios');

const endpoints = [
    { name: 'Weather API', url: 'http://localhost:5000/api/weather/report?q=Visakhapatnam' },
    { name: 'Population API', url: 'http://localhost:5000/api/population/intel' },
    { name: 'Economy Intel (Gold, Silver, Fuel) API', url: 'http://localhost:5000/api/economy/intel' },
    { name: 'Stocks (Market Intel) API', url: 'http://localhost:5000/api/market/intel' }
];

async function verifyAll() {
    console.log("=== NEWS_PERCENT API ENDPOINT VERIFICATION ===");
    for (const ep of endpoints) {
        try {
            console.log(`\nTesting: ${ep.name}`);
            console.log(`URL: ${ep.url}`);
            const res = await axios.get(ep.url, { timeout: 8000 });
            console.log(`HTTP Status: ${res.status} OK`);
            
            // Preview JSON keys/structure
            if (res.data) {
                const keys = Object.keys(res.data);
                console.log(`JSON keys returned:`, keys);
                
                if (ep.name.includes('Weather')) {
                    console.log(`  Temp: ${res.data.temp}°C, City: ${res.data.city}, Source: ${res.data.source}`);
                } else if (ep.name.includes('Population')) {
                    console.log(`  Population Today: ${res.data.todayPopulation}, Growth: ${res.data.growthRate}`);
                } else if (ep.name.includes('Economy')) {
                    console.log(`  Gold Price: $${res.data.metals?.gold?.price}, Silver: $${res.data.metals?.silver?.price}`);
                    console.log(`  Fuel Location: ${res.data.fuel?.petrol?.city || 'Default'}, Petrol: ₹${res.data.fuel?.petrol?.price}`);
                } else if (ep.name.includes('Stocks')) {
                    console.log(`  Number of stocks: ${res.data.length}`);
                    if (res.data.length > 0) {
                        console.log(`  Sample stock:`, res.data[0]);
                    }
                }
            } else {
                console.log("  No data returned.");
            }
        } catch (err) {
            console.error(`  ERROR testing ${ep.name}:`, err.message);
            if (err.response) {
                console.error(`  Server status: ${err.response.status}`);
                console.error(`  Server response:`, JSON.stringify(err.response.data).substring(0, 300));
            }
        }
    }
    console.log("\n==============================================");
}

verifyAll();
