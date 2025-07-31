/*
  Warnings:

  - A unique constraint covering the columns `[huiGroupId,period]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unique_period_in_group";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_huiGroupId_period_key" ON "Payment"("huiGroupId", "period");
