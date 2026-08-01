const axios = require('axios');

async function testGoldAPI() {
    const key = process.env.GOLD_API_KEY || 'goldapi-e534f854ad9d063b91a413673b705ee7-io';
    const url = 'https://www.goldapi.io/api/XAU/USD';
    
    // Mask key
    let maskedKey = 'N/A';
    if (key && key.length > 8) {
        maskedKey = key.substring(0, 4) + '*'.repeat(16) + key.substring(key.length - 4);
    }
    
    console.log(`Testing GoldAPI with URL: ${url}`);
    console.log(`Masked Key: ${maskedKey}`);
    
    try {
        const res = await axios.get(url, {
            headers: { 'x-access-token': key },
            timeout: 6000
        });
        console.log('HTTP Status Code:', res.status);
        console.log('Response Body:', res.data);
    } catch (err) {
        const status = err.response ? err.response.status : 'No Status';
        const responseBody = err.response ? err.response.data : err.message;
        console.log('HTTP Status Code (Error):', status);
        console.log('Response Body (Error):', responseBody);
    }
}

testGoldAPI();
