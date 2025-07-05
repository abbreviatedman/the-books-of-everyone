const request = require('supertest');
const app = require('../app');

describe('GET /api/v1/characters', () => {
  it('should return all characters', async () => {
    const res = await request(app).get('/api/v1/characters');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('actors');
  });
});

describe('GET /api/v1/characters/:id', () => {
  it('should return a character by id', async () => {
    const validId = '685ddcd8e6e5c844c6b8edfc';
    const res = await request(app).get(`/api/v1/characters/${validId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Quentin Coldwater');
  });

  it('should return 404 for invalid id', async () => {
    const res = await request(app).get('/api/v1/characters/invalidid123');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/v1/episodes', () => {
  it('should return all episodes', async () => {
    const res = await request(app).get('/api/v1/episodes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('code');
  });
});

describe('GET /api/v1/episodes/:id', () => {
  it('should return an episode by id', async () => {
    const validId = '685ddcd6e6e5c844c6b8edfb';
    const res = await request(app).get(`/api/v1/episodes/${validId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Unauthorized Magic');
  });

  it('should return 404 for invalid id', async () => {
    const res = await request(app).get('/api/v1/episodes/invalidid123');
    expect(res.statusCode).toBe(404);
  });
});
