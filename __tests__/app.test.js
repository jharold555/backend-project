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
  test("returns a 404 error for id that does not exist", async () => {
    const response = await request(app).get("/api/articles/70").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });

  test("returns a 400 error for incorrect id type", async () => {
    const response = await request(app).get("/api/articles/banana").expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
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
  test("returns correct comment count in object", async () => {
    const response = await request(app).get("/api/articles/5").expect(200);
    const article = response.body.article;
    expect(article).toHaveProperty("comment_count", "2");
  });
});

describe("GET /api/articles", () => {
  test("returns 200 status code", async () => {
    await request(app).get("/api/articles").expect(200);
  });

  test("responds with array of article objects", async () => {
    const response = await request(app).get("/api/articles").expect(200);
    const { articles } = response.body;
    expect(articles).toHaveLength(10);
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
  test("returns 404 error message for non-existent article id", async () => {
    const postData = {
      username: "butter_bridge",
      body: "hello",
    };
    const response = await request(app)
      .post("/api/articles/18/comments")
      .send(postData)
      .expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });

  test("returns 400 error for invalid request body", async () => {
    const postData = {};
    const response = await request(app)
      .post("/api/articles/6/comments")
      .send(postData)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for empty request body properties", async () => {
    const postData = {
      user: "butter_bridge",
      body: "",
    };
    const response = await request(app)
      .post("/api/articles/6/comments")
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
    const post = { inc_votes: "ds" };
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
    await request(app).delete("/api/comments/8").expect(204);
  });
  test("deletes comment from database", async () => {
    await request(app).delete("/api/comments/8").expect(204);

    const response = await request(app).get("/api/1/comments").expect(200);
    expect(
      response.body.comments.every((comment) => comment.comment_id !== 8)
    ).toBe(true);
  });
});
describe("GET /api/users", () => {
  test("returns array of all user objects with correct properties", async () => {
    const response = await request(app).get("/api/users").expect(200);
    const users = response.body.users;
    expect(users.length).toBe(4);
    users.forEach((user) => {
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("avatar_url");
    });
  });
});
describe("FEATURE GET /api/articles", () => {
  test("404 if topic doesnt exist", async () => {
    const response = await request(app)
      .get("/api/articles?topic=bob")
      .expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("400 error if sort_by column doesnt exist", async () => {
    const response = await request(app)
      .get("/api/articles?sort_by=555")
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("400 error if order is not asc or dsc", async () => {
    const response = await request(app)
      .get("/api/articles?order=as")
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("sorts by query", async () => {
    const response = await request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200);
    expect(response.body.articles).toBeSortedBy("author");
  });
  test("filters by topic", async () => {
    const response = await request(app)
      .get("/api/articles?topic=cats")
      .expect(200);
    response.body.articles.forEach((article) =>
      expect(article.topic === "cats").toBe(true)
    );
  });
  test("filters by topic and sorts by query", async () => {
    const response = await request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc")
      .expect(200);
    response.body.articles.forEach((article) =>
      expect(article.topic === "mitch").toBe(true)
    );
    expect(response.body.articles).toBeSortedBy("title");
  });
});
describe("GET /api/users/:username", () => {
  test("returns a 404 error for username that does not exist", async () => {
    const response = await request(app).get("/api/users/jim").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("returns user object with correct properties", async () => {
    const response = await request(app)
      .get("/api/users/icellusedkars")
      .expect(200);
    const user = response.body;
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("avatar_url");
  });
  test("returns user object with correct username", async () => {
    const response = await request(app)
      .get("/api/users/icellusedkars")
      .expect(200);
    const user = response.body;
    expect(user.username).toBe("icellusedkars");
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  test("returns a 400 error for incorrect id type", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/comments/bann")
      .send(post)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns a 404 error for id that does not exist", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/comments/85")
      .send(post)
      .expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("returns 400 error for invalid request body", async () => {
    const post = {};
    const response = await request(app)
      .patch("/api/comments/5")
      .send(post)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("updates votes for comment in database", async () => {
    const post = { inc_votes: 6 };
    await request(app).patch("/api/comments/2").send(post).expect(200);
    const newVotes = await db.query(
      "SELECT votes FROM comments WHERE comment_id = 2"
    );
    expect(newVotes.rows[0].votes).toBe(20);
  });
  test("returns single comment", async () => {
    const post = { inc_votes: 6 };
    const response = await request(app)
      .patch("/api/comments/1")
      .send(post)
      .expect(200);
    const comment = response.body.comment;
    expect(comment).toMatchObject({
      article_id: 9,
      author: "butter_bridge",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      comment_id: 1,
      created_at: "2020-04-06T12:17:00.000Z",
      votes: 22,
    });
  });
});
describe("POST /api/articles", () => {
  test("returns 400 error for empty req object", async () => {
    const data = {};
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for empty req object properties", async () => {
    const data = {
      author: "butter_bridge",
      title: "jon",
      body: "",
      topic: "paper",
      article_img_url: "img.url",
    };
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for author not in database", async () => {
    const data = {
      author: "bob",
      title: "jon",
      body: "hello",
      topic: "paper",
      article_img_url: "",
    };
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for topic not in database", async () => {
    const data = {
      author: "icellusedkars",
      title: "jon",
      body: "hello",
      topic: "dogs",
      article_img_url: "",
    };
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns article with correct properties and values", async () => {
    const data = {
      author: "butter_bridge",
      title: "jon",
      body: "hello",
      topic: "paper",
      article_img_url: "img.url",
    };
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(201);
    const article = response.body.article;
    expect(article).toHaveProperty("article_id", 14);
    expect(article).toHaveProperty("article_img_url", "img.url");
    expect(article).toHaveProperty("author", "butter_bridge");
    expect(article).toHaveProperty("body", "hello");
    expect(article).toHaveProperty("comment_count", "0");
    expect(article).toHaveProperty("created_at");
    expect(article).toHaveProperty("title", "jon");
    expect(article).toHaveProperty("topic", "paper");
    expect(article).toHaveProperty("votes", 0);
  });
  test("returns article with correct properties with url default", async () => {
    const data = {
      author: "butter_bridge",
      title: "jon",
      body: "hello",
      topic: "paper",
      article_img_url: "",
    };
    const response = await request(app)
      .post("/api/articles")
      .send(data)
      .expect(201);
    const article = response.body.article;
    expect(article).toHaveProperty(
      "article_img_url",
      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    );
  });
  test("updates database with article", async () => {
    const data = {
      author: "butter_bridge",
      title: "jon",
      body: "hello",
      topic: "paper",
      article_img_url: "img.url",
    };
    await request(app).post("/api/articles").send(data).expect(201);
    const response = await request(app)
      .get("/api/articles?limit=20")
      .expect(200);
    const articles = response.body.articles;
    expect(articles.length).toBe(14);
    expect(articles[0]).toMatchObject({
      author: "butter_bridge",
      title: "jon",
      topic: "paper",
      article_img_url: "img.url",
    });
  });
});
describe("PAGINATION GET /api/articles", () => {
  test("returns only 10 article objects as default", async () => {
    const response = await request(app).get("/api/articles?p=1");
    const articles = response.body.articles;
    expect(articles.length).toBe(10);
  });
  test("returns number of articles for limit specified", async () => {
    const response = await request(app).get("/api/articles?limit=4&p=1");
    const articles = response.body.articles;
    expect(articles.length).toBe(4);
  });
  test("returns next set of articles offset by limit", async () => {
    const response1 = await request(app).get("/api/articles?limit=5&p=1");
    const articles1 = response1.body.articles;
    const response2 = await request(app).get("/api/articles?limit=5&p=2");
    const articles2 = response2.body.articles;
    expect(articles2.length).toBe(5);
    articles2.forEach((article) => {
      expect(articles1).not.toContain(article);
    });
  });
  test("returns total count as property on response body", async () => {
    const response = await request(app).get("/api/articles?limit=4&p=1");
    const total = response.body.total_count;
    expect(total).toBe("13");
  });
  test("total count displays total with any filters applied", async () => {
    const response = await request(app).get(
      "/api/articles?topic=cats&limit=4&p=1"
    );
    const total = response.body.total_count;
    expect(total).toBe("1");
  });
  test("returns 400 error if limit not a number", async () => {
    const response = await request(app).get(
      "/api/articles?topic=cats&limit=h&p=1"
    );
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error if page not a number", async () => {
    const response = await request(app).get(
      "/api/articles?topic=cats&limit=8&p=h"
    );
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 404 error if page number exceeds number of articles to return", async () => {
    const response = await request(app).get(
      "/api/articles?topic=cats&limit=8&p=8"
    );
    expect(response.body.msg).toBe("404 articles Not Found");
  });
});
describe("PAGINATION GET /api/:article_id/comments", () => {
  test("returns number of comments for limit specified", async () => {
    const response = await request(app).get("/api/3/comments?limit=1&p=1");
    const comments = response.body.comments;
    expect(comments.length).toBe(1);
  });
  test("returns next set of comments offset by limit", async () => {
    const response1 = await request(app).get("/api/5/comments?limit=1&p=1");
    const comments1 = response1.body.comments;
    const response2 = await request(app).get("/api/5/comments?limit=1&p=2");
    const comments2 = response2.body.comments;
    expect(comments2.length).toBe(1);
    comments2.forEach((comment) => {
      expect(comments1).not.toContain(comment);
    });
  });
  test("returns 400 error if limit not a number", async () => {
    const response = await request(app).get("/api/2/comments?limit=h&p=1");
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error if page not a number", async () => {
    const response = await request(app).get("/api/2/comments?limit=8&p=h");
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 404 error if page number exceeds number of articles to return", async () => {
    const response = await request(app).get("/api/5/comments?limit=1&p=8");
    expect(response.body.msg).toBe("404 comments Not Found");
  });
});
describe("POST /api/topics", () => {
  test("returns 400 error for invalid req body", async () => {
    const data = {};
    const response = await request(app)
      .post("/api/topics")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 400 error for empty slug/description", async () => {
    const data = {
      slug: "bob",
      description: "",
    };
    const response = await request(app)
      .post("/api/topics")
      .send(data)
      .expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns topic object", async () => {
    const data = {
      slug: "bob",
      description: "dogs",
    };
    const response = await request(app)
      .post("/api/topics")
      .send(data)
      .expect(201);
    expect(response.body.topic).toEqual({ slug: "bob", description: "dogs" });
  });
  test("updates database with topic", async () => {
    const data = {
      slug: "bob",
      description: "dogs",
    };
    await request(app).post("/api/topics").send(data).expect(201);
    const response = await request(app).get("/api/topics").expect(200);
    const topics = response.body.topics;
    expect(topics.length).toBe(4);
  });
});
describe("DELETE /api/articles/:article_id", () => {
  test("returns 400 error for invalid id data type", async () => {
    const response = await request(app).delete("/api/articles/ban").expect(400);
    expect(response.body.msg).toBe("400 Bad Request");
  });
  test("returns 404 error for non-existent article id", async () => {
    const response = await request(app).delete("/api/articles/17").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("deletes article from database", async () => {
    await request(app).delete("/api/articles/2").expect(204);
    const response = await request(app).get("/api/articles/2").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
  test("deletes comments for article from database", async () => {
    await request(app).delete("/api/articles/5").expect(204);
    const response = await request(app).get("/api/5/comments").expect(404);
    expect(response.body.msg).toBe("404 Not Found");
  });
});
