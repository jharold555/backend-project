const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");


beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});
describe('handles incorrect url error', () => {
    test('404 error', () => {
        return request(app).get('/api/topi').expect(404).then(({body}) => {
            expect(body.msg).toBe('Bad route')
        })
    })
})
describe("GET /api/topics", () => {
    
  test("returns 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("responds with array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { topics } = response.body;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});
describe('GET apis', () => {
    test('returns 200 status code', () => {
        return request(app).get("/api").expect(200)
    })
    test('returns an object containing api info', () => {
    return request(app)
    .get('/api')
    .expect(200)
    .then(response => {
        const data = response.body
        expect(data.apis).toHaveProperty('GET /api/topics')
        expect(data.apis).toHaveProperty('GET /api')
        expect(data.apis).toHaveProperty('GET /api/articles')
    })
    })
})
