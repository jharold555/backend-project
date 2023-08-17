const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const { checkExists, patchVotes } = require("../db/utils.js");

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
    expect(response.body.msg).toBe("404 Not Found");
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
      expect(article).toHaveProperty("votes");
      expect(article).toHaveProperty("created_at");
      expect(article).toHaveProperty("topic");
      expect(article).toHaveProperty("article_img_url");
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

describe("GET /api/:article_id/comments", () => {
  test("returns a 400 error for incorrect id data type", async () => {
    const response = await request(app).get("/api/ba/comments").expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });

  test("returns 404 error for article id that does not exist", async () => {
    const response = await request(app).get("/api/65/comments").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });

  test("returns 404 error if no comments for article", async () => {
    const response = await request(app).get("/api/4/comments").expect(404);
    expect(response.body.msg).toBe("404 comments Not Found");
  });

  test("returns 200 status code", async () => {
    await request(app).get("/api/3/comments").expect(200);
  });

  test("comments sorted by most recent first", async () => {
    const response = await request(app).get("/api/3/comments").expect(200);
    const { comments } = response.body;
    expect(comments).toBeSortedBy("created_at", {
      descending: true,
    });
  });

  test("returns array of comment objects for article id", async () => {
    const response = await request(app).get("/api/3/comments").expect(200);
    const { comments } = response.body;
    expect(comments.length).toBe(2);
    expect(comments).toMatchObject([
      {
        body: "Ambidextrous marsupial",
        votes: 0,
        author: "icellusedkars",
        article_id: 3,
        created_at: "2020-09-19T23:10:00.000Z",
      },
      {
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        article_id: 3,
        created_at: "2020-06-20T07:24:00.000Z",
      },
    ]);
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("returns 400 error message for invalid article id data type", async () => {
    const postData = {
      username: "butter_bridge",
      body: "hello",
    };
    const response = await request(app)
      .post("/api/articles/nn/comments")
      .send(postData)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error message for non-existent article id", async () => {
    const postData = {
      username: "butter_bridge",
      body: "hello",
    };
    const response = await request(app)
      .post("/api/articles/18/comments")
      .send(postData)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for non-existent user (invalid req body)", async () => {
    const postData = {
      username: "bob",
      body: "hello",
    };
    const response = await request(app)
      .post("/api/articles/6/comments")
      .send(postData)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for invalid request body", async () => {
    const postData = {};
    const response = await request(app)
      .post("/api/articles/6/comments")
      .send(postData)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns comment object", async () => {
    const postData = {
      username: "butter_bridge",
      body: "hello",
    };
    const response = await request(app)
      .post("/api/articles/6/comments")
      .send(postData)
      .expect(201);
    expect(response.body).toMatchObject({
      article_id: 6,
      author: "butter_bridge",
      body: "hello",
      comment_id: 19,
      created_at: response.body.created_at,
      votes: 0,
    });
  });
  test("updates database", async () => {
    const original = await checkExists("comments", "article_id", 6);
    const postData = {
      username: "butter_bridge",
      body: "hello5",
    };
    await request(app)
      .post("/api/articles/6/comments")
      .send(postData)
      .expect(201);
    const updated = await checkExists("comments", "article_id", 6);
    expect(updated.rows.length).toBe(original.rows.length + 1);
    expect(updated.rows.some((obj) => obj.body === "hello5")).toBe(true);
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("returns a 400 error for incorrect id type", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/articles/banan")
      .send(post)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns a 404 error for id that does not exist", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/articles/85")
      .send(post)
      .expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("returns 400 error for invalid request body", async () => {
    const post = {};
    const response = await request(app)
      .patch("/api/articles/5")
      .send(post)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for invalid inc_votes data type", async () => {
    const post = { inc_votes: 'ds'};
    const response = await request(app)
      .patch("/api/articles/5")
      .send(post)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("updates votes for article in database", async () => {
    const post = { inc_votes: 6 };
    await request(app).patch("/api/articles/1").send(post).expect(200);
    const newVotes = await db.query(
      "SELECT votes FROM articles WHERE article_id = 1"
    );
    expect(newVotes.rows[0].votes).toBe(106);
  });
  test("returns article", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/articles/1")
      .send(post)
      .expect(200);
    expect(response.body.article).toMatchObject({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 106,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("returns a 400 error for incorrect id type", async () => {
    const response = await request(app)
      .delete("/api/comments/banann")
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns a 404 error for non-existent id", async () => {
    const response = await request(app).delete("/api/comments/678").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("returns 204 status with no content", async () => {
    const response = await request(app).delete("/api/comments/8").expect(204);
    expect(response.body).toEqual({});
  });
  test("deletes comment from database", async () => {
    await request(app).delete("/api/comments/8").expect(204);

    const response = await request(app).get("/api/1/comments").expect(200);
    expect(
      response.body.comments.every((comment) => comment.comment_id !== 8)
    ).toBe(true);
  });
});
