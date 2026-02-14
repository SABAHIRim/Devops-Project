const request = require("supertest");
const app = require("../src/app");
const { openDb } = require("../src/db");

describe("Tests d'intégration - Profil", () => {
    test("GET /api/users/me/profile devrait retourner 401 sans token", async () => {
const res = await request(app).get("/profile/me/profile");        expect(res.statusCode).toBe(401);
    });
});