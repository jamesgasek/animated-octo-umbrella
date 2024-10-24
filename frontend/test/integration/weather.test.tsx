// test/integration/weather.test.tsx
import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import React from 'react';

describe('Weather App Integration Tests', () => {
  // Skip these tests in CI environment or when running unit tests
//   let itif = process.env.RUN_INTEGRATION_TESTS ? it : it.skip;
let itif = it

//   const itif = it;

  // Optional: Add before all to check if API is available
  beforeAll(async () => {
    try {
      const response = await fetch('http://localhost:3000/');
      if (!response.ok) {
        throw new Error('API is not running');
      }
      else{
      itif = it;
      }
    } catch (error) {
      console.warn('Warning: API is not running. Integration tests will be skipped.');
      itif = it.skip
      return;
    }
  });

  itif('fetches real weather data for valid ZIP code', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '10001'); // Using New York ZIP code
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Current Weather')).toBeInTheDocument();
      // Don't test for specific temperature values since they change
      // Instead test for structure and format
      expect(screen.getByText(/\d+°C/)).toBeInTheDocument();
      expect(screen.getByText(/\d+°F/)).toBeInTheDocument();
      expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    }, { timeout: 5000 }); // Increased timeout for API calls
  });

  itif('handles invalid ZIP code with real API', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '00000'); // Invalid ZIP code
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Zip code is not valid. please try again.')).toBeInTheDocument();
    });
  });

  itif('displays real forecast data', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '10001');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      // Check for forecast structure
      const forecastCards = screen.getAllByRole('article'); // Assuming your Cards have role="article"
      expect(forecastCards).toHaveLength(5);
      
      // Check for temperature format in each card
      forecastCards.forEach(card => {
        expect(card).toHaveTextContent(/\d+°/);
      });
    }, { timeout: 8000 });
  });
});