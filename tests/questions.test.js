

const {
  request,
  app,
  resetDb,
  registerAndLogin,
  createQuestion,
} = require("./helpers");

beforeEach(resetDb);

describe("Question routes", () => {

  it("returns 401 without token", async () => {
    const res = await request(app)
      .get("/api/questions");

    expect(res.status).toBe(401);
  });

  it("creates a question", async () => {
  const token = await registerAndLogin();

  const res = await request(app)
    .post("/api/questions")
    .set("Authorization", `Bearer ${token}`)
    .field("question", "What does HTTP stand for?")
    .field("answer", "HyperText Transfer Protocol")
    .field("keywords", "web,http");

  console.log("CREATE QUESTION RESPONSE:", res.status, res.body);

  expect(res.status).toBe(201);
  expect(res.body.question).toBe("What does HTTP stand for?");
});

  it("returns all questions", async () => {
    const token = await registerAndLogin();

    await createQuestion(token);

    const res = await request(app)
      .get("/api/questions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("returns 404 for unknown question", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/questions/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid question body", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        question: "",
      });

    expect(res.status).toBe(400);
  });

  it("plays a question correctly", async () => {
    const token = await registerAndLogin();

    const question = await createQuestion(token);

    const res = await request(app)
      .post(`/api/questions/${question.id}/play`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        answer: "HyperText Transfer Protocol",
      });

    expect(res.status).toBe(201);
    expect(res.body.correct).toBe(true);
  });

  it("returns false for wrong answer", async () => {
    const token = await registerAndLogin();

    const question = await createQuestion(token);

    const res = await request(app)
      .post(`/api/questions/${question.id}/play`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        answer: "Wrong Answer",
      });

    expect(res.status).toBe(201);
    expect(res.body.correct).toBe(false);
  });

});