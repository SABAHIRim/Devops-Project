const request = require("supertest");
const app = require("../src/app");

describe("Tests d'intégration complets", () => {
    // Test 1: Vérifier que l'API répond
    test("GET /auth/me sans token doit être rejeté", async () => {
        const res = await request(app).get("/auth/me");
        expect(res.statusCode).toBe(401);
    });

    // Test 2: Vérifier la validation (Unitaire)
    test("Inscription avec mot de passe court doit échouer", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ username: "test", email: "test@test.com", password: "123" });
        expect(res.statusCode).toBe(400);
    });
});