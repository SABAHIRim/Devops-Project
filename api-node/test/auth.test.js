process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");
const { openDb } = require("../src/db");
const { hashPassword } = require("../src/utils/password");

// Augmente le timeout Jest (évite le fail CI à 5000ms)
jest.setTimeout(20000);

let token;

beforeAll(async () => {
  const db = await openDb();
  await db.run("DELETE FROM users");

  const hashed = await hashPassword("Password1");
  await db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    ["testuser", "test@test.com", hashed]
  );

  await db.close();
});

describe("POST /auth/register", () => {
  it("crée un utilisateur", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        email: "new@test.com",
        password: "Password1",
      });

    expect(res.statusCode).toBe(201);
  });
});
