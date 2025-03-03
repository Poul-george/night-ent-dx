/*
  Warnings:

  - Made the column `storeId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "storeId" SET NOT NULL,
ALTER COLUMN "storeId" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "casts" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "salarySystem" DECIMAL(12,2),
    "monthlySalary" DECIMAL(12,2),
    "hourlyWage" DECIMAL(12,2),
    "backSetting" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "casts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_casts_store_id" ON "casts"("storeId");

-- CreateIndex
CREATE INDEX "idx_casts_name" ON "casts"("name");
