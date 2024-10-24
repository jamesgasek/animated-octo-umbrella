import { describe, expect, jest, beforeAll, it } from '@jest/globals';
import request from 'supertest';

jest.mock('better-sqlite3', () => {
 return jest.fn().mockImplementation(() => ({
   prepare: jest.fn().mockReturnValue({
     run: jest.fn(),
     get: jest.fn().mockReturnValue({ count: 0 })
   }),
   exec: jest.fn()
 }));
});

describe('Weather API', () => {
 let app: any;

 beforeAll(async () => {
   const serverModule = await import('../src/server.js');
   app = serverModule.app;
 });

 describe('Basic Endpoints', () => {
   it('should serve the root endpoint', async () => {
     const response = await request(app).get('/');
     expect(response.status).toBe(200);
     expect(response.text).toBe('hello world!');
   });

   it('should serve the cache stats endpoint', async () => {
     const response = await request(app).get('/cache-stats');
     expect(response.status).toBe(200);
     expect(response.body).toHaveProperty('currentWeather');
     expect(response.body).toHaveProperty('forecasts');
     expect(response.body).toHaveProperty('coordinates');
   });
 });

 describe('Weather Endpoint', () => {
   it('should reject invalid zip codes', async () => {
     const invalidZips = ['1234', '123456', 'abcde', '!@#$%'];
     
     for (const zip of invalidZips) {
       const response = await request(app).get(`/weather/${zip}`);
       expect(response.status).toBe(400);
       expect(response.body.error).toBe('Invalid ZIP code provided');
     }
   });

   it('should reject non-US zip codes', async () => {
     const nonUSZips = ['SW1A 1AA', 'M5V 2T6', '2000']; // UK, Canada, Australia
     
     for (const zip of nonUSZips) {
       const response = await request(app).get(`/weather/${zip}`);
       expect(response.status).toBe(400);
       expect(response.body.error).toBe('Invalid ZIP code provided');
     }
   });

   it('should handle valid US zip codes', async () => {
     const validZips = ['10001', '90210', '60601', '02108'];
     
     for (const zip of validZips) {
       const response = await request(app).get(`/weather/${zip}`);
       expect(response.status).toBe(200);
       expect(response.body).toMatchObject({
         current: {
           temperature: {
             celsius: expect.any(Number),
             fahrenheit: expect.any(Number)
           },
           humidity: expect.any(Number),
           windSpeed: expect.any(Number),
           description: expect.any(String)
         },
         forecast: expect.any(Array)
       });
       expect(response.body.forecast).toHaveLength(5);
     }
   });
 });
});