// --- WARNING: You might need to install dotenv if you haven't already: npm install dotenv ---
// This line ensures your .env variables (like OPENWEATHER_API_KEY) are loaded.
require('dotenv').config({ path: './.env' });

// Import the Clothing controller class (Adjust the path if necessary)
const Clothing = require('./Clothing');

async function runWeatherTest() {
    console.log("--- Starting OpenWeatherMap API Test ---");

    // 1. Define Test Coordinates (Example: New York City, USA)
    const testLat = 40.7128;
    const testLon = -74.0060;

    // Check if the API Key is loaded before calling the function
    const apiKeyStatus = !!process.env.OPENWEATHER_API_KEY ? "Loaded" : "MISSING/undefined";
    console.log(`OpenWeatherMap API Key Status: ${apiKeyStatus}`);
    console.log(`Attempting to fetch weather for coordinates: Lat=${testLat}, Lon=${testLon}`);

    // 2. Call the static getWeather method directly
    const weatherResult = await Clothing.getWeather(testLat, testLon);

    // 3. Check the results
    if (weatherResult && !weatherResult.error) {
        console.log("------------------------------------------");
        console.log("✅ SUCCESS! Weather Data Received:");
        console.log(`Location: ${weatherResult.location}`);
        console.log(`Temperature: ${weatherResult.temperature}°C`);
        console.log(`Condition: ${weatherResult.description}`);
        console.log("------------------------------------------");
    } else {
        console.error("------------------------------------------");
        console.error("❌ FAILED to get weather data.");
        if (weatherResult && weatherResult.error) {
            console.error("Error Details:", weatherResult.error);
        } else {
            console.error("Check your .env file and console logs in Clothing.js for API key or connection errors.");
        }
        console.error("------------------------------------------");
    }

    console.log("--- Test Complete ---");
}

// Execute the test function
runWeatherTest();