const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const questions = [
  {
    question: "What does HTTP stand for?",
    answer: "HyperText Transfer Protocol",
    keywords: ["http", "web"],
  },
  {
    question: "Which method is used to create data?",
    answer: "POST",
    keywords: ["http", "method"],
  },
  {
    question: "What does REST stand for?",
    answer: "Representational State Transfer",
    keywords: ["rest", "api"],
  },
];

async function main() {
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("1234", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  for (const item of questions) {
    await prisma.question.create({
      data: {
        question: item.question,
        answer: item.answer,
        userId: user.id,
        keywords: {
          connectOrCreate: item.keywords.map((kw) => ({
            where: {
              name: kw,
            },
            create: {
              name: kw,
            },
          })),
        },
      },
    });
  }

  console.log("Seed data inserted successfully");
  console.log("Login email: admin@example.com");
  console.log("Login password: 1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });