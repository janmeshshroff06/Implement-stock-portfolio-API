import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash("Password123!", 10);

const seedUsers = [
  {
    email: "admin@example.com",
    role: "ADMIN",
    portfolios: [
      {
        name: "Admin Growth Portfolio",
        description: "Admin-owned seeded portfolio for role-based testing",
        holdings: [
          {
            symbol: "AAPL",
            totalShares: 25,
            avgPrice: 150,
            transactions: [
              {
                type: "BUY",
                quantity: 25,
                price: 150,
                transactionDate: new Date("2026-01-15T14:30:00.000Z"),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    email: "investor@example.com",
    role: "USER",
    portfolios: [
      {
        name: "Investor Long-Term Portfolio",
        description: "Regular user portfolio for ownership testing",
        holdings: [
          {
            symbol: "MSFT",
            totalShares: 40,
            avgPrice: 310,
            transactions: [
              {
                type: "BUY",
                quantity: 40,
                price: 310,
                transactionDate: new Date("2026-02-01T14:30:00.000Z"),
              },
            ],
          },
          {
            symbol: "TSLA",
            totalShares: 10,
            avgPrice: 225,
            transactions: [
              {
                type: "BUY",
                quantity: 10,
                price: 225,
                transactionDate: new Date("2026-02-10T14:30:00.000Z"),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    email: "not-owner@example.com",
    role: "USER",
    portfolios: [
      {
        name: "Not Owner Watchlist",
        description: "Second regular user portfolio for forbidden access tests",
        holdings: [
          {
            symbol: "GOOGL",
            totalShares: 12,
            avgPrice: 140,
            transactions: [
              {
                type: "BUY",
                quantity: 12,
                price: 140,
                transactionDate: new Date("2026-03-01T14:30:00.000Z"),
              },
            ],
          },
        ],
      },
    ],
  },
];

async function createSeedUser(seedUser) {
  const user = await prisma.user.create({
    data: {
      email: seedUser.email,
      passwordHash,
      role: seedUser.role,
      portfolios: {
        create: seedUser.portfolios.map((portfolio) => ({
          name: portfolio.name,
          description: portfolio.description,
          holdings: {
            create: portfolio.holdings.map((holding) => ({
              symbol: holding.symbol,
              totalShares: holding.totalShares,
              avgPrice: holding.avgPrice,
              transactions: {
                create: holding.transactions,
              },
            })),
          },
        })),
      },
    },
  });

  return user;
}

async function main() {
  const seedEmails = seedUsers.map((user) => user.email);

  await prisma.user.deleteMany({
    where: {
      email: {
        in: seedEmails,
      },
    },
  });

  for (const seedUser of seedUsers) {
    await createSeedUser(seedUser);
  }

  console.log("Seed complete.");
  console.log("Known login credentials:");
  console.log("admin@example.com / Password123!");
  console.log("investor@example.com / Password123!");
  console.log("not-owner@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
