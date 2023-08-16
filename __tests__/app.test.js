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

describe("handles incorrect url error", () => {
  test("400 error", async () => {
    const response = await request(app).get("/api/topi").expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
});

describe("GET /api/topics", () => {
  test("returns 200 status code", async () => {
    await request(app).get("/api/topics").expect(200);
  });

  test("responds with array of topic objects", async () => {
    const response = await request(app).get("/api/topics").expect(200);
    const { topics } = response.body;
    expect(Array.isArray(topics)).toBe(true);
    expect(topics).toHaveLength(3);
    topics.forEach((topic) => {
      expect(topic).toHaveProperty("slug");
      expect(topic).toHaveProperty("description");
    });
  });
});

describe("GET apis", () => {
  test("returns 200 status code", async () => {
    await request(app).get("/api").expect(200);
  });

  test("returns an object containing api info", async () => {
    const response = await request(app).get("/api").expect(200);
    const data = response.body;
    const endpoints = require("../endpoints.json");
    expect(data.apis).toEqual(endpoints);
  });
});

describe("GET /api/articles/:article_id", () => {
  test("returns 200 status code", async () => {
    await request(app).get("/api/articles/2").expect(200);
  });

  test("responds with correct article object with article_id property", async () => {
    const response = await request(app).get("/api/articles/2").expect(200);
    const { article } = response.body;
    expect(article).toMatchObject({
      article_id: 2,
      title: "Sony Vaio; or, The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      created_at: "2020-10-16T05:03:00.000Z",
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });

  test("returns a 404 error for id that does not exist", async () => {
    const response = await request(app).get("/api/articles/70").expect(404);
    expect(response.body.msg).toBe("404 article_id of 70 Not Found");
  });

  test("returns a 400 error for incorrect id type", async () => {
    const response = await request(app).get("/api/articles/banana").expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
});

describe("GET /api/articles", () => {
  test("returns 200 status code", async () => {
    await request(app).get("/api/articles").expect(200);
  });

  test("responds with array of article objects", async () => {
    const response = await request(app).get("/api/articles").expect(200);
    const { articles } = response.body;
    expect(articles).toHaveLength(13);
    articles.forEach((article) => {
      expect(article).toHaveProperty("author");
      expect(article).toHaveProperty("title");
      expect(article).toHaveProperty("article_id");
      expect(article).toHaveProperty("comment_count");
      expect(article).not.toHaveProperty("body");
    });
  });

  test("returns correct comment count", async () => {
    const response = await request(app).get("/api/articles").expect(200);
    const { articles } = response.body;
    expect(parseInt(articles[4].comment_count)).toBe(0);
    expect(parseInt(articles[7].comment_count)).toBe(2);
  });

  test("returns articles in descending order by date", async () => {
    const response = await request(app).get("/api/articles").expect(200);
    const { articles } = response.body;
    expect(articles).toBeSortedBy("created_at", {
      descending: true,
    });
  });
});
