import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Root from '../src/Root';
import React from 'react';

// Mock fetch globally
global.fetch = vi.fn();

describe('Weather App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the recent locations fetch to return empty array by default
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/recent-locations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ recentLocations: [] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  test('renders main heading', () => {
    render(<Root />);
    expect(screen.getByText('My Awesome Weather App')).toBeInTheDocument();
  });

  test('shows error for invalid zip code format', async () => {
    render(<Root />);
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '123');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a valid 5-digit ZIP code')).toBeInTheDocument();
  });

  test('shows error when API returns 400', async () => {
    // Override the default mock for this specific test
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/recent-locations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ recentLocations: [] })
        });
      }
      return Promise.resolve({
        status: 400,
        ok: false
      });
    });

    render(<Root />);
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '12345');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Zip code is not valid. please try again.')).toBeInTheDocument();
    });
  });

  test('displays weather data on successful API call', async () => {
    const mockWeatherData = {
      current: {
        temperature: {
          celsius: 20,
          fahrenheit: 68
        },
        humidity: 65,
        windSpeed: 5.2,
        description: "sunny",
        icon: "01d"
      },
      forecast: Array(5).fill(null).map((_, index) => ({
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: {
          min: 15,
          max: 25
        },
        humidity: 60,
        windSpeed: 4.8,
        description: "sunny",
        icon: "01d"
      }))
    };

    // Override the default mock for this specific test
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/recent-locations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ recentLocations: [] })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockWeatherData)
      });
    });

    render(<Root />);
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '12345');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Current Weather')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('68°F')).toBeInTheDocument();
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
  });

  test('shows loading state while fetching', async () => {
    // Create a delayed mock response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/recent-locations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ recentLocations: [] })
        });
      }
      return new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({})
      }), 100));
    });

    render(<Root />);
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '12345');
    await userEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });
});