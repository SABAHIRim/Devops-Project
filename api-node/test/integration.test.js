process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");
const { openDb } = require("../src/db");
const { hashPassword } = require("../src/utils/password");
const jwt = require("jsonwebtoken");

const BASE = "/profile"; // ✅ vu que toi tu utilises /profile/me/profile dans ton projet

describe("Integration tests - Profile feature", () => {
  let db;
  let userId;
  let token;

  beforeAll(async () => {
    db = await openDb();

    await db.run("DELETE FROM chat_messages");
    await db.run("DELETE FROM users");

    const hashed = await hashPassword("Password1");

    const result = await db.run(
      `INSERT INTO users (username, email, password, display_name, bio, avatar_url, theme, timezone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "profileuser",
        "profile@test.com",
        hashed,
        "Imane",
        "Bio test",
        "https://example.com/avatar.png",
        "dark",
        "UTC",
      ]
    );

    userId = result.lastID;

    // ✅ On génère un token sans login
    token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await db.close();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ============================================================
  // GET /profile/me/profile
  // ============================================================
  test("GET /profile/me/profile sans token → 401", async () => {
    const res = await request(app).get(`${BASE}/me/profile`);
    expect(res.statusCode).toBe(401);
  });

  test("GET /profile/me/profile avec token → 200", async () => {
    const res = await request(app)
      .get(`${BASE}/me/profile`)
      .set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("profile@test.com");
    expect(res.body.display_name).toBe("Imane");
  });

  // ============================================================
  // PUT /profile/me/profile
  // ============================================================
  test("PUT /profile/me/profile sans token → 401", async () => {
    const res = await request(app)
      .put(`${BASE}/me/profile`)
      .send({ display_name: "NewName" });

    expect(res.statusCode).toBe(401);
  });

  test("PUT /profile/me/profile avec token → 200 + update", async () => {
    const update = await request(app)
      .put(`${BASE}/me/profile`)
      .set(auth())
      .send({
        display_name: "Updated Name",
        bio: "Updated bio",
        avatar_url: "https://example.com/new.png",
      });

    expect(update.statusCode).toBe(200);

    const check = await request(app)
      .get(`${BASE}/me/profile`)
      .set(auth());

    expect(check.statusCode).toBe(200);
    expect(check.body.display_name).toBe("Updated Name");
    expect(check.body.bio).toBe("Updated bio");
  });

  // ============================================================
  // GET /profile/me/activity
  // ============================================================
  test("GET /profile/me/activity sans token → 401", async () => {
    const res = await request(app).get(`${BASE}/me/activity`);
    expect(res.statusCode).toBe(401);
  });

  test("GET /profile/me/activity avec token → 200 + array", async () => {
    // injecter des messages
    for (let i = 0; i < 3; i++) {
      await db.run(
        "INSERT INTO chat_messages (user_id, content, created_at) VALUES (?, ?, datetime('now'))",
        [userId, `msg-${i}`]
      );
    }

    const res = await request(app)
      .get(`${BASE}/me/activity`)
      .set(auth());

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("description");
  });

  // ============================================================
  // GET /profile/me/stats
  // ============================================================
  test("GET /profile/me/stats sans token → 401", async () => {
    const res = await request(app).get(`${BASE}/me/stats`);
    expect(res.statusCode).toBe(401);
  });

  test("GET /profile/me/stats avec token → 200 + total_messages", async () => {
    const res = await request(app)
      .get(`${BASE}/me/stats`)
      .set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("total_messages");
    expect(typeof res.body.total_messages).toBe("number");
  });

  // ============================================================
  // PATCH /profile/me/preferences
  // ============================================================
  test("PATCH /profile/me/preferences sans token → 201", async () => {
    const res = await request(app)
      .patch(`${BASE}/me/preferences`)
      .send({ theme: "light" });

    expect(res.statusCode).toBe(201);
  });

  test("PATCH /profile/me/preferences avec token → 200", async () => {
    const res = await request(app)
      .patch(`${BASE}/me/preferences`)
      .set(auth())
      .send({ theme: "light", timezone: "Africa/Casablanca" });

    expect(res.statusCode).toBe(200);

    const check = await request(app)
      .get(`${BASE}/me/profile`)
      .set(auth());

    expect(check.statusCode).toBe(200);
    expect(check.body.theme).toBe("light");
  });
});
