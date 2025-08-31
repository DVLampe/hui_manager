/*
  Warnings:

  - You are about to drop the `PaymentHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentHistory" DROP CONSTRAINT "PaymentHistory_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentHistory" DROP CONSTRAINT "PaymentHistory_paymentId_fkey";

-- DropTable
DROP TABLE "public"."PaymentHistory";
