const axios = require('axios');

async function testFuel(fuelType, locationType, extraParams) {
  console.log(`--- Testing Fuel API: fuel_type=${fuelType}, location_type=${locationType} ---`);
  try {
    const res = await axios.get('https://fuel.indianapi.in/live_fuel_price', {
      headers: {
        'x-api-key': 'sk-live-kL3JzfGtjyqvUIYFxHDAHZuadiFiQjyTMt8nO0bG'
      },
      params: {
        fuel_type: fuelType,
        location_type: locationType,
        ...extraParams
      }
    });
    console.log('Success (keys/sample):', Array.isArray(res.data) ? res.data.slice(0, 5) : res.data);
  } catch (err) {
    console.error('Error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

async function run() {
  await testFuel('petrol', 'state');
}

run();
