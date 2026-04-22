import { prisma } from "./prisma.js";

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function recalculateHoldingState(transactions) {
  const orderedTransactions = [...transactions].sort(
    (left, right) =>
      new Date(left.transactionDate).getTime() - new Date(right.transactionDate).getTime(),
  );

  let totalShares = 0;
  let totalCost = 0;

  for (const transaction of orderedTransactions) {
    if (transaction.type === "BUY") {
      totalShares += transaction.quantity;
      totalCost += transaction.quantity * transaction.price;
      continue;
    }

    if (transaction.quantity > totalShares) {
      throw new Error("Sell transaction exceeds available shares");
    }

    const averageCost = totalShares === 0 ? 0 : totalCost / totalShares;
    totalShares -= transaction.quantity;
    totalCost -= averageCost * transaction.quantity;
  }

  return {
    totalShares: roundCurrency(totalShares),
    avgPrice: totalShares > 0 ? roundCurrency(totalCost / totalShares) : 0,
  };
}

export async function syncHoldingFromTransactions(holdingId, db = prisma) {
  const transactions = await db.transaction.findMany({
    where: { holdingId },
    orderBy: { transactionDate: "asc" },
  });

  const nextState = recalculateHoldingState(transactions);

  await db.holding.update({
    where: { id: holdingId },
    data: nextState,
  });

  return nextState;
}
