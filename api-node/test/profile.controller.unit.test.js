const profileController = require("../src/controllers/profile.controller");
const { openDb } = require("../src/db");

jest.mock("../src/db", () => ({
  openDb: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Unit tests - profile.controller", () => {
  let db;

  beforeEach(() => {
    db = {
      get: jest.fn(),
      all: jest.fn(),
      run: jest.fn(),
      close: jest.fn(),
    };
    openDb.mockResolvedValue(db);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // getUserProfile(req.params.id)
  // ============================================================
  test("getUserProfile → 200 si user existe", async () => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    db.get.mockResolvedValue({
      id: 1,
      username: "imane",
      email: "imane@test.com",
    });

    await profileController.getUserProfile(req, res);

    expect(db.get).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, email: "imane@test.com" })
    );
  });

  test("getUserProfile → 404 si user n'existe pas", async () => {
    const req = { params: { id: 999 } };
    const res = mockRes();

    db.get.mockResolvedValue(undefined);

    await profileController.getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
  });

  test("getUserProfile → 500 si erreur DB", async () => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    db.get.mockRejectedValue(new Error("DB error"));

    await profileController.getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
  });

  // ============================================================
  // getUserProfileMe(req.userId)
  // ============================================================
  test("getUserProfileMe → 200 si userId valide", async () => {
    const req = { userId: 1 };
    const res = mockRes();

    db.get.mockResolvedValue({ id: 1, email: "profile@test.com" });

    await profileController.getUserProfileMe(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ email: "profile@test.com" })
    );
  });

  test("getUserProfileMe → 404 si user supprimé", async () => {
    const req = { userId: 1 };
    const res = mockRes();

    db.get.mockResolvedValue(undefined);

    await profileController.getUserProfileMe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
  });

  // ============================================================
  // updateMyProfile(req.userId + body)
  // ============================================================
  test("updateMyProfile → 200 si update OK", async () => {
    const req = {
      userId: 1,
      body: { display_name: "New", bio: "Bio", avatar_url: "url" },
    };
    const res = mockRes();

    db.run.mockResolvedValue({});

    await profileController.updateMyProfile(req, res);

    expect(db.run).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Profil mis à jour avec succès",
    });
  });

  test("updateMyProfile → 500 si erreur DB", async () => {
    const req = {
      userId: 1,
      body: { display_name: "New", bio: "Bio", avatar_url: "url" },
    };
    const res = mockRes();

    db.run.mockRejectedValue(new Error("DB update failed"));

    await profileController.updateMyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB update failed" });
  });

  // ============================================================
  // getMyActivity
  // ============================================================
  test("getMyActivity → 200 + array", async () => {
    const req = { userId: 1 };
    const res = mockRes();

    db.all.mockResolvedValue([{ id: 1, description: "msg" }]);

    await profileController.getMyActivity(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, description: "msg" }]);
  });

  test("getMyActivity → 500 si erreur", async () => {
    const req = { userId: 1 };
    const res = mockRes();

    db.all.mockRejectedValue(new Error("DB all error"));

    await profileController.getMyActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB all error" });
  });

  // ============================================================
  // getMyStats
  // ============================================================
  test("getMyStats → 200 + total_messages", async () => {
    const req = { userId: 1 };
    const res = mockRes();

    db.get.mockResolvedValue({ count: 7 });

    await profileController.getMyStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      tasks_completed: 0,
      polls_voted: 0,
      total_messages: 7,
    });
  });

  // ============================================================
  // updatePreferences
  // ============================================================
  test("updatePreferences → 200 + theme/timezone", async () => {
    const req = { userId: 1, body: { theme: "light", timezone: "UTC" } };
    const res = mockRes();

    db.run.mockResolvedValue({});

    await profileController.updatePreferences(req, res);

    expect(db.run).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      theme: "light",
      timezone: "UTC",
      message: "Préférences mises à jour",
    });
  });

  // ============================================================
  // getUsers
  // ============================================================
  test("getUsers → 200 + list users", async () => {
    const req = {};
    const res = mockRes();

    db.all.mockResolvedValue([{ id: 1, username: "imane" }]);

    await profileController.getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, username: "imane" }]);
  });
});

