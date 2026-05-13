const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const prisma = require("../lib/prisma");

const {
  ConflictError,
  UnauthorizedError,
} = require("../lib/errors");

const router = express.Router();

const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
});

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getJwtSecret() {
  return process.env.JWT_SECRET || "test-secret";
}

router.post("/register", async (req, res, next) => {
  try {
    const data = RegisterInput.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = LoginInput.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const ok = await bcrypt.compare(data.password, user.password);

    if (!ok) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


