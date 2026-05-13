const {
  request,
  app,
  resetDb,
  registerAndLogin,
  createQuestion,
} = require("./helpers");

beforeEach(resetDb);

describe("Boundary tests", () => {
  it("clamps limit above 100 to 100", async () => {
    const token = await registerAndLogin();

    await createQuestion(token);

    const res = await request(app)
      .get("/api/questions?limit=999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(100);
  });

  it("treats page=0 as page=1", async () => {
    const token = await registerAndLogin();

    await createQuestion(token);

    const res = await request(app)
      .get("/api/questions?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });

  it("treats page=-1 as page=1", async () => {
    const token = await registerAndLogin();

    await createQuestion(token);

    const res = await request(app)
      .get("/api/questions?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });
});

