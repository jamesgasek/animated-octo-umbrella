import { describe, expect, jest, beforeAll, it } from '@jest/globals';
import request from 'supertest';

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({ run: jest.fn(), get: jest.fn() }),
    exec: jest.fn()
  }));
});


describe('Basic Server Test', () => {
  let app: any;

  beforeAll(async () => {
    const serverModule = await import('../src/server.js');
    app = serverModule.app;
  });

  it('should respond with hello world', async () => {
    const response = await request(app).get('/');
    expect(response.text).toBe('hello world!');
    expect(response.status).toBe(200);
  });
});

// jest.ex