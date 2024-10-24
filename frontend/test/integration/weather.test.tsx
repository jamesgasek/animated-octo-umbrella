import { describe, expect, test  } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Root from '../../src/Root';
// import React from 'react';

describe('Weather App Integration Tests', () => {
  // Start with skip as the default
  let conditionalTest = test;

  // Check if API is available before running tests
/*   beforeAll(async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      if (response.ok) {
        conditionalTest = test;
      } else {
        console.warn('Warning: API is not running. Integration tests will be skipped.');
      }
    } catch (error) {
      console.warn('Warning: API is not running. Integration tests will be skipped.');
    }
  }); */

  conditionalTest('fetches real weather data for valid ZIP code', async () => {
    render(<Root />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '10001');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Current Weather')).toBeInTheDocument();
      expect(screen.getByText(/\d+°C/)).toBeInTheDocument();
      expect(screen.getByText(/\d+°F/)).toBeInTheDocument();
      expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  conditionalTest('handles invalid ZIP code with real API', async () => {
    render(<Root />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
   
    await userEvent.clear(input);
    await userEvent.type(input, '00000');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Zip code is not valid. please try again.")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  conditionalTest('displays real forecast data', async () => {
    render(<Root />);
    
    const input = screen.getByPlaceholderText('Enter ZIP code');
    const submitButton = screen.getByRole('button');
    
    await userEvent.type(input, '10001');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      const forecastCards = screen.getAllByRole('article');
      expect(forecastCards).toHaveLength(5);
      
      forecastCards.forEach(card => {
        expect(card).toHaveTextContent(/\d+°/);
      });
    }, { timeout: 3000 });
  });
});