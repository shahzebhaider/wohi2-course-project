const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

function formatQuestion(question) {
  return {
    ...question,
    keywords: question.keywords.map((k) => k.name)
  };
}

// GET all questions
router.get("/", async (req, res) => {
  try {
    const { keyword } = req.query;

    const where = keyword
      ? {
          keywords: {
            some: {
              name: keyword
            }
          }
        }
      : {};

    const questions = await prisma.question.findMany({
      where,
      include: { keywords: true },
      orderBy: { id: "asc" }
    });

    res.json(questions.map(formatQuestion));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET one question by id
router.get("/:qId", async (req, res) => {
  try {
    const qId = Number(req.params.qId);

    const question = await prisma.question.findUnique({
      where: { id: qId },
      include: { keywords: true }
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(formatQuestion(question));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST create new question
router.post("/", async (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: "question and answer are mandatory"
      });
    }

    const keywordsArray = Array.isArray(keywords) ? keywords : [];

    const newQuestion = await prisma.question.create({
      data: {
        question,
        answer,
        keywords: {
          connectOrCreate: keywordsArray.map((kw) => ({
            where: { name: kw },
            create: { name: kw }
          }))
        }
      },
      include: { keywords: true }
    });

    res.status(201).json(formatQuestion(newQuestion));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT update question
router.put("/:qId", async (req, res) => {
  try {
    const qId = Number(req.params.qId);
    const { question, answer, keywords } = req.body;

    const existingQuestion = await prisma.question.findUnique({
      where: { id: qId }
    });

    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question || !answer) {
      return res.status(400).json({
        message: "question and answer are mandatory"
      });
    }

    const keywordsArray = Array.isArray(keywords) ? keywords : [];

    const updatedQuestion = await prisma.question.update({
      where: { id: qId },
      data: {
        question,
        answer,
        keywords: {
          set: [],
          connectOrCreate: keywordsArray.map((kw) => ({
            where: { name: kw },
            create: { name: kw }
          }))
        }
      },
      include: { keywords: true }
    });

    res.json(formatQuestion(updatedQuestion));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE question
router.delete("/:qId", async (req, res) => {
  try {
    const qId = Number(req.params.qId);

    const question = await prisma.question.findUnique({
      where: { id: qId },
      include: { keywords: true }
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await prisma.question.delete({
      where: { id: qId }
    });

    res.json({
      message: "Question deleted successfully",
      question: formatQuestion(question)
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;