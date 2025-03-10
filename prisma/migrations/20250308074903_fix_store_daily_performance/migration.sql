/*
  Warnings:

  - You are about to drop the column `castDailyPayment` on the `store_daily_performance` table. All the data in the column will be lost.
  - You are about to drop the column `employeeDailyPayment` on the `store_daily_performance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "store_daily_performance" DROP COLUMN "castDailyPayment",
DROP COLUMN "employeeDailyPayment";
