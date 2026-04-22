import express from "express";
import swaggerUi from "swagger-ui-express";
import { createToken, hashPassword, verifyPassword, verifyToken } from "./lib/auth.js";
import { syncHoldingFromTransactions } from "./lib/holdings.js";
import { openApiDocument } from "./openapi.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

function isAdmin(user) {
  return user?.role === "ADMIN";
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function badRequest(message) {
  return { status: 400, message };
}

function parseIdParam(value, resourceName) {
  const parsedId = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw badRequest(`Invalid ${resourceName} ID format`);
  }

  return parsedId;
}

function parsePositiveNumber(value, fieldName) {
  const parsedNumber = Number(value);

  if (!Number.isFinite(parsedNumber) || parsedNumber <= 0) {
    throw badRequest(`${fieldName} must be a positive number`);
  }

  return parsedNumber;
}

function parseNonNegativeNumber(value, fieldName) {
  const parsedNumber = Number(value);

  if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
    throw badRequest(`${fieldName} must be a non-negative number`);
  }

  return parsedNumber;
}

function parseDate(value, fieldName) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw badRequest(`${fieldName} must be a valid date`);
  }

  return parsedDate;
}

function getBearerToken(headerValue) {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice("Bearer ".length).trim();
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function sendError(res, error) {
  if (error?.status) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
}

function validateSignupBody(body) {
  if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password)) {
    throw badRequest("Email and password are required");
  }

  if (body.password.trim().length < 8) {
    throw badRequest("Password must be at least 8 characters long");
  }
}

function validatePortfolioCreate(body) {
  if (!isNonEmptyString(body.name)) {
    throw badRequest("Portfolio name is required");
  }
}

function validatePortfolioUpdate(body) {
  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    throw badRequest("Portfolio name must be a non-empty string");
  }

  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    throw badRequest("Portfolio description must be a string");
  }
}

function validateHoldingCreate(body) {
  const portfolioId = parseIdParam(body.portfolioId, "portfolio");
  const totalShares = parseNonNegativeNumber(body.totalShares, "totalShares");
  const avgPrice = parseNonNegativeNumber(body.avgPrice, "avgPrice");

  if (!isNonEmptyString(body.symbol)) {
    throw badRequest("Holding symbol is required");
  }

  return {
    portfolioId,
    symbol: body.symbol.trim().toUpperCase(),
    totalShares,
    avgPrice,
  };
}

function validateHoldingUpdate(body) {
  const data = {};

  if (body.symbol !== undefined) {
    if (!isNonEmptyString(body.symbol)) {
      throw badRequest("Holding symbol must be a non-empty string");
    }

    data.symbol = body.symbol.trim().toUpperCase();
  }

  if (body.totalShares !== undefined) {
    data.totalShares = parseNonNegativeNumber(body.totalShares, "totalShares");
  }

  if (body.avgPrice !== undefined) {
    data.avgPrice = parseNonNegativeNumber(body.avgPrice, "avgPrice");
  }

  if (Object.keys(data).length === 0) {
    throw badRequest("At least one holding field is required");
  }

  return data;
}

function validateTransactionCreate(body) {
  const holdingId = parseIdParam(body.holdingId, "holding");
  const quantity = parsePositiveNumber(body.quantity, "quantity");
  const price = parsePositiveNumber(body.price, "price");
  const transactionDate = parseDate(body.transactionDate, "transactionDate");

  if (!["BUY", "SELL"].includes(body.type)) {
    throw badRequest("Transaction type must be BUY or SELL");
  }

  return {
    holdingId,
    type: body.type,
    quantity,
    price,
    transactionDate,
  };
}

function validateTransactionUpdate(body) {
  const data = {};

  if (body.type !== undefined) {
    if (!["BUY", "SELL"].includes(body.type)) {
      throw badRequest("Transaction type must be BUY or SELL");
    }

    data.type = body.type;
  }

  if (body.quantity !== undefined) {
    data.quantity = parsePositiveNumber(body.quantity, "quantity");
  }

  if (body.price !== undefined) {
    data.price = parsePositiveNumber(body.price, "price");
  }

  if (body.transactionDate !== undefined) {
    data.transactionDate = parseDate(body.transactionDate, "transactionDate");
  }

  if (Object.keys(data).length === 0) {
    throw badRequest("At least one transaction field is required");
  }

  return data;
}

async function getPortfolioOrThrow(id) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
  });

  if (!portfolio) {
    throw { status: 404, message: "Portfolio not found" };
  }

  return portfolio;
}

async function getHoldingOrThrow(id) {
  const holding = await prisma.holding.findUnique({
    where: { id },
    include: {
      portfolio: true,
    },
  });

  if (!holding) {
    throw { status: 404, message: "Holding not found" };
  }

  return holding;
}

async function getTransactionOrThrow(id) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      holding: {
        include: {
          portfolio: true,
        },
      },
    },
  });

  if (!transaction) {
    throw { status: 404, message: "Transaction not found" };
  }

  return transaction;
}

function ensurePortfolioAccess(user, portfolio) {
  if (!isAdmin(user) && portfolio.userId !== user.id) {
    throw { status: 403, message: "Forbidden" };
  }
}

function ensureHoldingAccess(user, holding) {
  if (!isAdmin(user) && holding.portfolio.userId !== user.id) {
    throw { status: 403, message: "Forbidden" };
  }
}

function ensureTransactionAccess(user, transaction) {
  if (!isAdmin(user) && transaction.holding.portfolio.userId !== user.id) {
    throw { status: 403, message: "Forbidden" };
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    validateSignupBody(req.body);

    const user = await prisma.user.create({
      data: {
        email: req.body.email.trim().toLowerCase(),
        passwordHash: await hashPassword(req.body.password),
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    if (!isNonEmptyString(req.body.email) || !isNonEmptyString(req.body.password)) {
      throw badRequest("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email: req.body.email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await verifyPassword(req.body.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      token: createToken(user),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/api/portfolios", requireAuth, async (req, res) => {
  try {
    validatePortfolioCreate(req.body);

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: req.user.id,
        name: req.body.name.trim(),
        description: req.body.description ?? null,
      },
    });

    return res.status(201).json(portfolio);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/portfolios", requireAuth, async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: isAdmin(req.user) ? {} : { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(portfolios);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/portfolios/:id", requireAuth, async (req, res) => {
  try {
    const portfolioId = parseIdParam(req.params.id, "portfolio");
    const portfolio = await getPortfolioOrThrow(portfolioId);
    ensurePortfolioAccess(req.user, portfolio);

    return res.json(portfolio);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/portfolios/:id/summary", requireAuth, async (req, res) => {
  try {
    const portfolioId = parseIdParam(req.params.id, "portfolio");
    const portfolio = await getPortfolioOrThrow(portfolioId);
    ensurePortfolioAccess(req.user, portfolio);

    const holdings = await prisma.holding.findMany({
      where: { portfolioId },
    });

    const totalInvestment = holdings.reduce(
      (sum, holding) => sum + holding.totalShares * holding.avgPrice,
      0,
    );
    const totalValue = totalInvestment;

    return res.json({
      totalValue: Number(totalValue.toFixed(2)),
      totalInvestment: Number(totalInvestment.toFixed(2)),
      profitLoss: Number((totalValue - totalInvestment).toFixed(2)),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.put("/api/portfolios/:id", requireAuth, async (req, res) => {
  try {
    const portfolioId = parseIdParam(req.params.id, "portfolio");
    validatePortfolioUpdate(req.body);

    const portfolio = await getPortfolioOrThrow(portfolioId);
    ensurePortfolioAccess(req.user, portfolio);

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...(req.body.name !== undefined ? { name: req.body.name.trim() } : {}),
        ...(req.body.description !== undefined ? { description: req.body.description } : {}),
      },
    });

    return res.json(updatedPortfolio);
  } catch (error) {
    return sendError(res, error);
  }
});

app.delete("/api/portfolios/:id", requireAuth, async (req, res) => {
  try {
    const portfolioId = parseIdParam(req.params.id, "portfolio");
    const portfolio = await getPortfolioOrThrow(portfolioId);
    ensurePortfolioAccess(req.user, portfolio);

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/api/holdings", requireAuth, async (req, res) => {
  try {
    const data = validateHoldingCreate(req.body);
    const portfolio = await getPortfolioOrThrow(data.portfolioId);
    ensurePortfolioAccess(req.user, portfolio);

    const holding = await prisma.holding.create({
      data,
    });

    return res.status(201).json(holding);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/holdings", requireAuth, async (req, res) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: isAdmin(req.user) ? {} : { portfolio: { userId: req.user.id } },
      include: {
        portfolio: {
          select: { id: true, name: true, userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(holdings);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/holdings/:id", requireAuth, async (req, res) => {
  try {
    const holdingId = parseIdParam(req.params.id, "holding");
    const holding = await getHoldingOrThrow(holdingId);
    ensureHoldingAccess(req.user, holding);

    return res.json(holding);
  } catch (error) {
    return sendError(res, error);
  }
});

app.put("/api/holdings/:id", requireAuth, async (req, res) => {
  try {
    const holdingId = parseIdParam(req.params.id, "holding");
    const data = validateHoldingUpdate(req.body);
    const holding = await getHoldingOrThrow(holdingId);
    ensureHoldingAccess(req.user, holding);

    const updatedHolding = await prisma.holding.update({
      where: { id: holdingId },
      data,
    });

    return res.json(updatedHolding);
  } catch (error) {
    return sendError(res, error);
  }
});

app.delete("/api/holdings/:id", requireAuth, async (req, res) => {
  try {
    const holdingId = parseIdParam(req.params.id, "holding");
    const holding = await getHoldingOrThrow(holdingId);
    ensureHoldingAccess(req.user, holding);

    await prisma.holding.delete({
      where: { id: holdingId },
    });

    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/api/transactions", requireAuth, async (req, res) => {
  try {
    const data = validateTransactionCreate(req.body);
    const holding = await getHoldingOrThrow(data.holdingId);
    ensureHoldingAccess(req.user, holding);

    const transaction = await prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.transaction.create({
        data,
      });

      await syncHoldingFromTransactions(holding.id, tx);
      return createdTransaction;
    });

    return res.status(201).json(transaction);
  } catch (error) {
    if (error?.message === "Sell transaction exceeds available shares") {
      return res.status(400).json({ error: error.message });
    }

    return sendError(res, error);
  }
});

app.get("/api/transactions", requireAuth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: isAdmin(req.user) ? {} : { holding: { portfolio: { userId: req.user.id } } },
      include: {
        holding: {
          select: { id: true, symbol: true, portfolioId: true },
        },
      },
      orderBy: { transactionDate: "desc" },
    });

    return res.json(transactions);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/api/transactions/:id", requireAuth, async (req, res) => {
  try {
    const transactionId = parseIdParam(req.params.id, "transaction");
    const transaction = await getTransactionOrThrow(transactionId);
    ensureTransactionAccess(req.user, transaction);

    return res.json(transaction);
  } catch (error) {
    return sendError(res, error);
  }
});

app.put("/api/transactions/:id", requireAuth, async (req, res) => {
  try {
    const transactionId = parseIdParam(req.params.id, "transaction");
    const data = validateTransactionUpdate(req.body);
    const transaction = await getTransactionOrThrow(transactionId);
    ensureTransactionAccess(req.user, transaction);

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const nextTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data,
      });

      await syncHoldingFromTransactions(transaction.holdingId, tx);
      return nextTransaction;
    });

    return res.json(updatedTransaction);
  } catch (error) {
    if (error?.message === "Sell transaction exceeds available shares") {
      return res.status(400).json({ error: error.message });
    }

    return sendError(res, error);
  }
});

app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
  try {
    const transactionId = parseIdParam(req.params.id, "transaction");
    const transaction = await getTransactionOrThrow(transactionId);
    ensureTransactionAccess(req.user, transaction);

    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      await syncHoldingFromTransactions(transaction.holdingId, tx);
    });

    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
});

app.use((error, _req, res, _next) => sendError(res, error));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
