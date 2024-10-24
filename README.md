# Weather App

A full-stack weather application that displays current weather conditions and 5-day forecasts for US ZIP codes, built with React and Node.js. The project uses npm workspaces to manage the frontend and backend packages.

## Features

- Current weather conditions display
- 5-day weather forecast
- Temperature in both Fahrenheit and Celsius
- Recent location history
- Dark/Light theme toggle
- Responsive design
- Input validation for US ZIP codes
- Error handling for invalid or non-existent ZIP codes

## Technology Stack

### Frontend
- React 18
- TypeScript
- Radix UI Components
- React Router for navigation
- Lucide React for icons
- Vitest for testing
- Testing Library for component testing
- Tailwind CSS for styling

### Backend
- Node.js
- Express
- OpenWeather API integration
- Jest for testing

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── Root.tsx
│   └── test/
│       ├── App.test.tsx
│       └── integration/
│           └── weather.test.tsx
├── backend/
│   ├── src/
│   │   └── server.ts
│   └── __tests__/
│       └── server.test.ts
├── package.json
└── weather_cache.db
```

## API Routes

### GET `/` (Health Check)
Returns a basic "hello world" response to verify the API is running.

**Response:**
```
hello world!
```

### GET `/weather/:zipCode`
Fetches weather data for a given ZIP code.

**Parameters:**
- `zipCode`: 5-digit US ZIP code

**Response:**
```json
{
  "current": {
    "temperature": {
      "celsius": number,
      "fahrenheit": number
    },
    "humidity": number,
    "windSpeed": number,
    "description": string,
    "icon": string
  },
  "forecast": [
    {
      "date": string,
      "temperature": {
        "min": number,
        "max": number
      },
      "humidity": number,
      "windSpeed": number,
      "description": string,
      "icon": string
    }
  ]
}
```

### GET `/recent-locations`
Retrieves recently searched ZIP codes.

**Response:**
```json
{
  "recentLocations": [
    {
      "zipCode": string,
      "lastUsed": string
    }
  ]
}
```



### GET `/cache-stats`
Returns statistics about the current cache state.

**Response:**
```json
{
  "currentWeather": { "count": number },
  "forecasts": { "count": number },
  "coordinates": { "count": number }
}
```

## Caching System

The application uses SQLite for caching weather data with different invalidation times:

### Cache Tables
- `coordinates`: Stores ZIP code to coordinate mappings
- `current_weather`: Stores current weather conditions
- `forecasts`: Stores 5-day forecast data

### Cache Duration
- Coordinates: 30 days
- Current Weather: 5 minutes
- Forecast Data: 1 hour

Cache cleanup runs every minute (except in test environment) to remove expired entries.

## Testing

### Frontend Tests (`frontend/test/`)

#### Unit Tests (`App.test.tsx`)
Tests component functionality using Vitest and Testing Library.

Run with:
```bash
npm run test -w frontend
```

#### Integration Tests (`integration/weather.test.tsx`)
Integration tests are part of the frontend test suite and test the full application with real API calls. Tests automatically skip if the backend API is not running.

### Backend Tests (`backend/__tests__/server.test.ts`)
Tests API endpoints using Jest and Supertest.

Run with:
```bash
npm run test -w backend
```

Additional test commands:
```bash
npm run test:watch -w backend    # Watch mode
npm run test:coverage -w backend # Coverage report
```

## Setup and Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies (using npm workspaces):
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev -w frontend
npm run dev -w backend
```

The frontend will be available at `http://localhost:5173`
The backend will be available at `http://localhost:3000`

## Development

### Frontend Development
Uses Vite for development with React and TypeScript:
```bash
npm run dev -w frontend    # Start development server
npm run test -w frontend   # Run tests
```

### Backend Development
Uses ts-node for TypeScript execution:
```bash
npm run dev -w backend     # Start development server
npm run test -w backend    # Run tests
npm run build -w backend   # Type check TypeScript
```

## NPM Workspace Structure

The project uses npm workspaces to manage both packages:
- `frontend/`: React frontend application
- `backend/`: Express backend server

Workspace commands:
```bash
npm run dev      # Start both frontend and backend
npm run test     # Run all tests
npm run build    # Build all packages
npm run lint     # Lint all packages
```

Note: Frontend and backend maintain separate TypeScript configurations.

## Error Handling

The application includes comprehensive error handling:
- Invalid ZIP code format validation
- Non-existent ZIP code handling
- API error handling
- Network error handling
- Loading state management

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.