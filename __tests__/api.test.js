const request = require('supertest');
const app = require('../index');

describe('GET /api/v1/characters', () => {
  it('should return all characters', async () => {
    const res = await request(app).get('/api/v1/characters');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('actors');
  });

  it('should return the first page of characters with limit', async () => {
    const res = await request(app).get('/api/v1/characters?limit=2&page=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name', 'Quentin Coldwater');
    expect(res.body[1]).toHaveProperty('name', 'Julia Wicker');
  });

  it('should return the second page of characters with limit', async () => {
    const res = await request(app).get('/api/v1/characters?limit=2&page=2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name', 'Alice Quinn');
    expect(res.body[1]).toHaveProperty('name', 'Eliot Waugh');
  });

  it('should return the first page of characters with default limit when no page or limit is provided', async () => {
    const res = await request(app).get('/api/v1/characters');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(30);
    expect(res.body[0]).toHaveProperty('name', 'Quentin Coldwater');
  });

  it('should return the first page of characters with custom limit and default page', async () => {
    const res = await request(app).get('/api/v1/characters?limit=2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name', 'Quentin Coldwater');
    expect(res.body[1]).toHaveProperty('name', 'Julia Wicker');
  });

  it('should return the first 30 characters when only page is provided', async () => {
    const res = await request(app).get('/api/v1/characters?page=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(30);
    expect(res.body[0]).toHaveProperty('name', 'Quentin Coldwater');
  });

  it('should return characters sorted by name descending (default)', async () => {
    const res = await request(app).get('/api/v1/characters?sort=name');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const names = res.body.map(c => c.name);
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  it('should return characters sorted by name ascending', async () => {
    const res = await request(app).get('/api/v1/characters?sort=name&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const names = res.body.map(c => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('should return characters sorted by number of quotes descending (default)', async () => {
    const res = await request(app).get('/api/v1/characters?sort=quotes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const quotesCounts = res.body.map(c => c.quotes.length);
    const sorted = [...quotesCounts].sort((a, b) => b - a);
    expect(quotesCounts).toEqual(sorted);
  });

  it('should return characters sorted by number of quotes ascending', async () => {
    const res = await request(app).get('/api/v1/characters?sort=quotes&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const quotesCounts = res.body.map(c => c.quotes.length);
    const sorted = [...quotesCounts].sort((a, b) => a - b);
    expect(quotesCounts).toEqual(sorted);
  });

  it('should return characters sorted by number of episodes descending (default)', async () => {
    const res = await request(app).get('/api/v1/characters?sort=episodes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const episodesCounts = res.body.map(c => c.episodes.length);
    const sorted = [...episodesCounts].sort((a, b) => b - a);
    expect(episodesCounts).toEqual(sorted);
  });

  it('should return characters sorted by number of episodes ascending', async () => {
    const res = await request(app).get('/api/v1/characters?sort=episodes&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const episodesCounts = res.body.map(c => c.episodes.length);
    const sorted = [...episodesCounts].sort((a, b) => a - b);
    expect(episodesCounts).toEqual(sorted);
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
