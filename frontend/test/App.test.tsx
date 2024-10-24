import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import React from 'react';

// Mock fetch
global.fetch = vi.fn();

describe('Weather App', () => {
 beforeEach(() => {
   vi.clearAllMocks();
 });

 test('renders main heading', () => {
   render(<App />);
   expect(screen.getByText('My Awesome Weather App')).toBeInTheDocument();
 });

 test('shows error for invalid zip code format', async () => {
   render(<App />);
   
   const input = screen.getByPlaceholderText('Enter ZIP code');
   const submitButton = screen.getByRole('button');

   await userEvent.type(input, '123');
   await userEvent.click(submitButton);

   expect(screen.getByText('Please enter a valid 5-digit ZIP code')).toBeInTheDocument();
 });

 test('shows error when API returns 400', async () => {
   (global.fetch as any).mockResolvedValueOnce({
     status: 400,
     ok: false
   });

   render(<App />);
   
   const input = screen.getByPlaceholderText('Enter ZIP code');
   const submitButton = screen.getByRole('button');

   await userEvent.type(input, '12345');
   await userEvent.click(submitButton);

   expect(screen.getByText('Zip code is not valid. please try again.')).toBeInTheDocument();
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
forecast: Array(5).fill(null).map((_, index) => {
      // Create a new date object and add index days to it
      const date = new Date('2024-03-20');
      date.setDate(date.getDate() + index);
      
      return {
        date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        temperature: {
          min: 15,
          max: 25
        },
        humidity: 60,
        windSpeed: 4.8,
        description: "sunny",
        icon: "01d"
      };
    })
  };

   (global.fetch as any).mockResolvedValueOnce({
     ok: true,
     json: async () => mockWeatherData,
   });

   render(<App />);
   
   const input = screen.getByPlaceholderText('Enter ZIP code');
   const submitButton = screen.getByRole('button');

   await userEvent.type(input, '12345');
   await userEvent.click(submitButton);

   await waitFor(() => {
     expect(screen.getByText('Current Weather')).toBeInTheDocument();
     expect(screen.getByText('20°C')).toBeInTheDocument();
     expect(screen.getByText('68°F')).toBeInTheDocument();
     expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
   });
 });

 test('shows loading state while fetching', async () => {
   (global.fetch as any).mockImplementation(() => 
     new Promise(resolve => setTimeout(resolve, 100))
   );

   render(<App />);
   
   const input = screen.getByPlaceholderText('Enter ZIP code');
   const submitButton = screen.getByRole('button');

   await userEvent.type(input, '12345');
   await userEvent.click(submitButton);

   expect(submitButton).toBeDisabled();
 });
});