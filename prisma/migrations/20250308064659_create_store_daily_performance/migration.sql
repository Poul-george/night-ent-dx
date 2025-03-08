-- CreateTable
CREATE TABLE "store_daily_performance" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "performanceDate" DATE NOT NULL,
    "cashSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cardSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "receivablesCollection" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "receivables" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "miscExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "castDailyPayment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "employeeDailyPayment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "setCount" INTEGER NOT NULL DEFAULT 0,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "actualCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coinCarryover" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transferredCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "store_daily_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_store_performance_date_for_store" ON "store_daily_performance"("storeId", "performanceDate");
