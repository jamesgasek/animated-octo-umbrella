import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { Card, Text, Heading, Flex, Button, TextField, Box, Container, Grid } from '@radix-ui/themes';
import { Search, Wind, Droplets, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface WeatherData {
  current: {
    temperature: {
      celsius: number;
      fahrenheit: number;
    };
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  }>;
}

export default function App() {
  const [zipCode, setZipCode] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/weather/${zipCode}`);
      if(response.status==400){
        setError('Zip code is not valid. please try again.');
        throw new Error('Failed to fetch weather data');
      }
      if (!response.ok) {
        setError('Could not fetch weather data. Please try again.');
        throw new Error('Failed to fetch weather data');
      }
      const data: WeatherData = await response.json();
      setWeather(data);
    } catch (err) {
      // console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="3">
      <Box py="6">
        <Heading size="7" /* align="center" */ mb="6" weight="bold">
          My Awesome Weather App
        </Heading>

        <Form.Root onSubmit={fetchWeather}>
          <Flex direction="column" gap="3">
            <Flex gap="3">
              <Box /* grow="1" */>
                <TextField.Root
                  size="3"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                />
              </Box>
              <Button 
                type="submit" 
                disabled={loading}
                variant="solid"
                size="3"
              >
                {loading ? (
                  <Loader2 width="16" height="16" style={{ animation: "spin 1s linear infinite" }}  />
                ) : (
                  <Search width="16" height="16" />
                )}
              </Button>
            </Flex>
            {error && (
              <Text color="red" size="2" weight="medium">
                {error}
              </Text>
            )}
          </Flex>
        </Form.Root>

        {weather && (
          <Box mt="6">
            {/* Current Weather */}
            <Card size="3" mb="4">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Box>
                    <Heading as="h2" size="4" mb="1" weight="medium">
                      Current Weather
                    </Heading>
                    <Text color="gray" size="2" weight="regular">
                      ZIP: {zipCode}
                    </Text>
                  </Box>
                  <Box p="2" style={{ backgroundColor: 'var(--gray-a2)' }}>
                    <img 
                      src={`http://openweathermap.org/img/w/${weather.current.icon}.png`}
                      alt="Weather icon"
                      width={48}
                      height={48}
                    />
                  </Box>
                </Flex>

                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center" gap="4">
                    <Text size="8" weight="bold">
                      {Math.round(weather.current.temperature.celsius)}°C
                    </Text>
                    <Text size="6" color="gray" weight="medium">
                      {Math.round(weather.current.temperature.fahrenheit)}°F
                    </Text>
                  </Flex>

                  <Text size="4" weight="medium" style={{ textTransform: 'capitalize' }}>
                    {weather.current.description}
                  </Text>

                  <Flex gap="6" mt="2">
                    <Flex align="center" gap="2">
                      <Box style={{ color: 'var(--gray-a11)' }}>
                        <Wind width="18" height="18" />
                      </Box>
                      <Text size="2" weight="medium">
                        {weather.current.windSpeed} m/s
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Box style={{ color: 'var(--gray-a11)' }}>
                        <Droplets width="18" height="18" />
                      </Box>
                      <Text size="2" weight="medium">
                        {weather.current.humidity}%
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Card>

            {/* 5-Day Forecast */}
            <Box>
              <Heading as="h3" size="3" mb="3" weight="medium">
                5-Day Forecast
              </Heading>
              <Grid columns="5" gap="3">
                {weather.forecast.map((day) => (
                  <Card key={day.date} size="2" role='article'>
                    <Flex direction="column" align="center" gap="2">
                      <Text size="2" weight="medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <img 
                        src={`http://openweathermap.org/img/w/${day.icon}.png`}
                        alt="Weather icon"
                        width={40}
                        height={40}
                      />
                      <Flex direction="column" align="center">
                        <Text size="3" weight="bold">
                          {Math.round(day.temperature.max)}°
                        </Text>
                        <Text size="2" color="gray">
                          {Math.round(day.temperature.min)}°
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}