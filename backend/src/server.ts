import express, { type Request, type Response, type NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const port = 3000;
app.use(cors());

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  COORDINATES: 30 * 24 * 60 * 60 * 1000, // 30 days
  CURRENT_WEATHER: 5 * 60 * 1000,        // 5 minutes
  FORECAST: 60 * 60 * 1000               // 1 hour
};

// Initialize SQLite database
const db = new Database('weather_cache.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS coordinates (
    zip_code TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS current_weather (
    location_key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS forecasts (
    location_key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

// Prepare statements
const statements = {
  getCoords: db.prepare('SELECT * FROM coordinates WHERE zip_code = ?'),
  setCoords: db.prepare('INSERT OR REPLACE INTO coordinates (zip_code, lat, lon, updated_at) VALUES (?, ?, ?, ?)'),
  getCurrentWeather: db.prepare('SELECT * FROM current_weather WHERE location_key = ?'),
  setCurrentWeather: db.prepare('INSERT OR REPLACE INTO current_weather (location_key, data, updated_at) VALUES (?, ?, ?)'),
  getForecast: db.prepare('SELECT * FROM forecasts WHERE location_key = ?'),
  setForecast: db.prepare('INSERT OR REPLACE INTO forecasts (location_key, data, updated_at) VALUES (?, ?, ?)'),
  cleanupWeather: db.prepare('DELETE FROM current_weather WHERE updated_at < ?'),
  cleanupForecasts: db.prepare('DELETE FROM forecasts WHERE updated_at < ?'),
  cleanupCoords: db.prepare('DELETE FROM coordinates WHERE updated_at < ?')
};

// Types
interface WeatherData {
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: Array<{ description: string; icon: string }>;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: { temp_min: number; temp_max: number; humidity: number };
    weather: Array<{ description: string; icon: string }>;
    wind: { speed: number };
  }>;
}

interface GeoData {
  lat: number;
  lon: number;
}

// Cache cleanup function
function cleanupCache() {
  const now = Date.now();
  statements.cleanupWeather.run(now - CACHE_DURATIONS.CURRENT_WEATHER);
  statements.cleanupForecasts.run(now - CACHE_DURATIONS.FORECAST);
  statements.cleanupCoords.run(now - CACHE_DURATIONS.COORDINATES);
}

async function getCoordinates(zipCode: string): Promise<GeoData> {
  const now = Date.now();
  const cached : any = statements.getCoords.get(zipCode);

  if (cached && (now - cached.updated_at) < CACHE_DURATIONS.COORDINATES) {
    return { lat: cached.lat, lon: cached.lon };
  }

  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${process.env.OPENWEATHER_API_KEY}`
  );
  if (!response.ok) throw new Error('Invalid zip code');
  
  const data = await response.json() as GeoData;
  statements.setCoords.run(zipCode, data.lat, data.lon, now);
  
  return data;
}

async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const locationKey = `${lat},${lon}`;
  const now = Date.now();
  const cached : any = statements.getCurrentWeather.get(locationKey);

  if (cached && (now - cached.updated_at) < CACHE_DURATIONS.CURRENT_WEATHER) {
    return JSON.parse(cached.data);
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );
  if (!response.ok) throw new Error('Weather data unavailable');
  
  const data = await response.json();
  statements.setCurrentWeather.run(locationKey, JSON.stringify(data), now);
  
  return data;
}

async function getForecast(lat: number, lon: number): Promise<ForecastData> {
  const locationKey = `${lat},${lon}`;
  const now = Date.now();
  const cached : any = statements.getForecast.get(locationKey);

  if (cached && (now - cached.updated_at) < CACHE_DURATIONS.FORECAST) {
    return JSON.parse(cached.data);
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );
  if (!response.ok) throw new Error('Forecast data unavailable');
  
  const data = await response.json();
  statements.setForecast.run(locationKey, JSON.stringify(data), now);
  
  return data;
}
app.get('/', (_req, res)=>{
  res.send("hello world!")
})

// Cache statistics endpoint
app.get('/cache-stats', (_req, res) => {
  const stats = {
    currentWeather: db.prepare('SELECT COUNT(*) as count FROM current_weather').get(),
    forecasts: db.prepare('SELECT COUNT(*) as count FROM forecasts').get(),
    coordinates: db.prepare('SELECT COUNT(*) as count FROM coordinates').get()
  };
  res.json(stats);
});

app.get('/weather/:zipCode', async (
  req: Request<{ zipCode: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.time('weather-request');
    const coords = await getCoordinates(req.params.zipCode);
    const [weather, forecast] = await Promise.all([
      getWeather(coords.lat, coords.lon),
      getForecast(coords.lat, coords.lon)
    ]);
    
    const dailyForecasts = forecast.list
      .filter((_item, index) => index % 8 === 0)
      .slice(0, 5)
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));

    res.json({
      current: {
        temperature: {
          celsius: weather.main.temp,
          fahrenheit: (weather.main.temp * 9/5) + 32
        },
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon
      },
      forecast: dailyForecasts
    });
    console.timeEnd('weather-request');
  } catch (error) {
    next(error);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  if (err.message.includes('Invalid zip code')) {
    res.status(400).json({ error: 'Invalid ZIP code provided' });
  } else if (err.message.includes('Weather data unavailable')) {
    res.status(503).json({ error: 'Weather service temporarily unavailable' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});

// Replace the bottom part of server.ts with:
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupCache, 60 * 1000);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export { app };