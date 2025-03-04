/*
  Warnings:

  - Made the column `startTime` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `overtime` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `drinkSubtotal` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `drinkSubtotalBack` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bottleSubtotal` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bottleSubtotalBack` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `foodSubtotal` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `foodSubtotalBack` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bonus` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `welfareCost` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dailyPayment` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `absenceDeduction` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `soriDeduction` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tardinessDeduction` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `otherDeductions` on table `cast_daily_performance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cast_daily_performance" ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "startTime" SET DEFAULT '00:00',
ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "endTime" SET DEFAULT '00:00',
ALTER COLUMN "overtime" SET NOT NULL,
ALTER COLUMN "overtime" SET DEFAULT 0,
ALTER COLUMN "drinkSubtotal" SET NOT NULL,
ALTER COLUMN "drinkSubtotal" SET DEFAULT 0,
ALTER COLUMN "drinkSubtotalBack" SET NOT NULL,
ALTER COLUMN "drinkSubtotalBack" SET DEFAULT 0,
ALTER COLUMN "bottleSubtotal" SET NOT NULL,
ALTER COLUMN "bottleSubtotal" SET DEFAULT 0,
ALTER COLUMN "bottleSubtotalBack" SET NOT NULL,
ALTER COLUMN "bottleSubtotalBack" SET DEFAULT 0,
ALTER COLUMN "foodSubtotal" SET NOT NULL,
ALTER COLUMN "foodSubtotal" SET DEFAULT 0,
ALTER COLUMN "foodSubtotalBack" SET NOT NULL,
ALTER COLUMN "foodSubtotalBack" SET DEFAULT 0,
ALTER COLUMN "bonus" SET NOT NULL,
ALTER COLUMN "bonus" SET DEFAULT 0,
ALTER COLUMN "welfareCost" SET NOT NULL,
ALTER COLUMN "welfareCost" SET DEFAULT 0,
ALTER COLUMN "dailyPayment" SET NOT NULL,
ALTER COLUMN "dailyPayment" SET DEFAULT 0,
ALTER COLUMN "absenceDeduction" SET NOT NULL,
ALTER COLUMN "absenceDeduction" SET DEFAULT 0,
ALTER COLUMN "soriDeduction" SET NOT NULL,
ALTER COLUMN "soriDeduction" SET DEFAULT 0,
ALTER COLUMN "tardinessDeduction" SET NOT NULL,
ALTER COLUMN "tardinessDeduction" SET DEFAULT 0,
ALTER COLUMN "otherDeductions" SET NOT NULL,
ALTER COLUMN "otherDeductions" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "casts" ADD CONSTRAINT "casts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_daily_performance" ADD CONSTRAINT "cast_daily_performance_castId_fkey" FOREIGN KEY ("castId") REFERENCES "casts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_daily_performance" ADD CONSTRAINT "cast_daily_performance_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
