

const bcrypt = require("bcrypt");

const {
  request,
  app,
  prisma,
  resetDb,
} = require("./helpers");

beforeEach(resetDb);

describe("Auth routes", () => {
  it("registers, hashes the password, and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "a@test.io",
        password: "pw12345",
        name: "A",
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));

    const user = await prisma.user.findUnique({
      where: {
        email: "a@test.io",
      },
    });

    expect(user).not.toBeNull();
    expect(user.password).not.toBe("pw12345");
    expect(await bcrypt.compare("pw12345", user.password)).toBe(true);
  });

  it("returns 409 for duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "a@test.io",
        password: "pw12345",
        name: "A",
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "a@test.io",
        password: "pw12345",
        name: "A",
      });

    expect(res.status).toBe(409);
  });

  it("returns 400 for missing register fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "",
        password: "",
        name: "",
      });

    expect(res.status).toBe(400);
  });

  it("logs in with valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "a@test.io",
        password: "pw12345",
        name: "A",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "a@test.io",
        password: "pw12345",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("returns 401 for wrong password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "a@test.io",
        password: "pw12345",
        name: "A",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "a@test.io",
        password: "wrong",
      });

    expect(res.status).toBe(401);
  });

  it("returns same error for missing user and wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@test.io",
        password: "wrong",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});