const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const questions = [
  {
    question: "What does HTTP stand for?",
    answer: "HyperText Transfer Protocol",
    keywords: ["http", "web"]
  },
  {
    question: "Which method is used to create data?",
    answer: "POST",
    keywords: ["http", "method"]
  },
  {
    question: "What does REST stand for?",
    answer: "Representational State Transfer",
    keywords: ["rest", "api"]
  }
];

async function main() {
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();

  for (const item of questions) {
    await prisma.question.create({
      data: {
        question: item.question,
        answer: item.answer,
        keywords: {
          connectOrCreate: item.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw }
          }))
        }
      }
    });
  }

  console.log("Seed data inserted successfully");

const hashedPassword = await bcrypt.hash("1234", 10);
const user = await prisma.user.create({
  data: {
    email: "admin@example.com",
    password: hashedPassword,
    name: "Admin User",
  },
});

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  model Question {
  id      Int     @id @default(autoincrement())
  title   String
  content String

  userId  Int
  user    User @relation(fields: [userId], references: [id])
}