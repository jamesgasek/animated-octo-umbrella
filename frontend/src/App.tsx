import { useEffect, useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { Card, Text, Heading, Flex, Button, TextField, Box, Container, Grid, Link } from '@radix-ui/themes';
import { Search, Wind, Droplets, Loader2, SunMoon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

interface RecentLocation {
  zipCode: string;
  lastUsed: string;
}

export default function App({ toggleTheme = () => {} }: { toggleTheme?: () => void }) { 
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [zipCode, setZipCode] = useState(searchParams.get('zip') || '');
  const [currentZip, setCurrentZip] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  // Fetch weather data when URL changes
  useEffect(() => {
    const zip = searchParams.get('zip');
    if (zip) {
      setZipCode(zip);
      fetchWeatherForZip(zip);
    }
  }, [searchParams]);

  const fetchRecentLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/recent-locations`);
      if (response.ok) {
        const data = await response.json();
        setRecentLocations(data.recentLocations);
      }
    } catch (err) {
      console.error('Failed to fetch recent locations');
    }
  };

  useEffect(() => {
    fetchRecentLocations();
  }, [currentZip]);

  const fetchWeatherForZip = async (zip: string) => {
    if (!/^\d{5}$/.test(zip)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/weather/${zip}`);
      if (response.status == 400) {
        setError('Zip code is not valid. please try again.');
        throw new Error('Failed to fetch weather data');
      }
      if (!response.ok) {
        setError('Could not fetch weather data. Please try again.');
        throw new Error('Failed to fetch weather data');
      }
      const data: WeatherData = await response.json();
      setWeather(data);
      setCurrentZip(zip);
      setSearchParams({ zip }); // Update URL
    } catch (err) {
      // console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWeatherForZip(zipCode);
  };

  return (
    <Container size="3" mx={'4'}>
      <Box py="6">
        <Flex justify="between" align="center" mb="6">
          <Heading size="8" weight="bold">
            My Awesome Weather App
          </Heading>
          <Box mt={"5"}>
            <SunMoon onClick={() => toggleTheme()} />
          </Box>
        </Flex>

        <Form.Root onSubmit={fetchWeather}>
          <Flex direction="column" gap="3">
            <Flex gap="3" direction="column">
              <Flex gap="3">
                <Box>
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
                  variant="soft"
                  size="3"
                >
                  {loading ? (
                    <Loader2 width="16" height="16" style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Search width="16" height="16" />
                  )}
                </Button>
              </Flex>

              {/* Recent Locations */}
              {recentLocations.length > 0 && (
                <Flex gap="2" wrap="wrap">
                  {recentLocations.map((location) => (
                    <Link
                      key={location.zipCode}
                      underline="hover"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchParams({ zip: location.zipCode });
                      }}
                      href={`/?zip=${location.zipCode}`}
                    >
                      {location.zipCode}
                    </Link>
                  ))}
                </Flex>
              )}
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
                      ZIP: {currentZip}
                    </Text>
                  </Box>
                  <Box p="2">
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
                      {Math.round(weather.current.temperature.fahrenheit)}°F
                    </Text>
                    <Text size="6" color="gray" weight="medium">
                      {Math.round(weather.current.temperature.celsius)}°C
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
              <Heading as="h3" size="3" mb="3" mt="5" weight="medium">
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