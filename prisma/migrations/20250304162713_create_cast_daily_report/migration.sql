-- CreateTable
CREATE TABLE "cast_daily_performance" (
    "id" SERIAL NOT NULL,
    "castId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "performanceDate" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "overtime" DECIMAL(5,2),
    "drinkSubtotal" DECIMAL(10,2),
    "drinkSubtotalBack" DECIMAL(10,2),
    "bottleSubtotal" DECIMAL(10,2),
    "bottleSubtotalBack" DECIMAL(10,2),
    "foodSubtotal" DECIMAL(10,2),
    "foodSubtotalBack" DECIMAL(10,2),
    "bonus" DECIMAL(10,2),
    "welfareCost" DECIMAL(10,2),
    "dailyPayment" DECIMAL(10,2),
    "absenceDeduction" DECIMAL(10,2),
    "soriDeduction" DECIMAL(10,2),
    "tardinessDeduction" DECIMAL(10,2),
    "otherDeductions" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cast_daily_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_store_performance_date" ON "cast_daily_performance"("storeId", "performanceDate");

-- CreateIndex
CREATE INDEX "idx_cast_store_performance_date" ON "cast_daily_performance"("castId", "storeId", "performanceDate");
