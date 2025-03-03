/*
  Warnings:

  - You are about to alter the column `salarySystem` on the `casts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - Made the column `salarySystem` on table `casts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "casts" ALTER COLUMN "salarySystem" SET NOT NULL,
ALTER COLUMN "salarySystem" SET DEFAULT 0,
ALTER COLUMN "salarySystem" SET DATA TYPE INTEGER;
