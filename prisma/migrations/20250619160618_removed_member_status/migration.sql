/*
  Warnings:

  - You are about to drop the column `status` on the `HuiMember` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "HuiMember_status_idx";

-- AlterTable
ALTER TABLE "HuiMember" DROP COLUMN "status";

-- DropEnum
DROP TYPE "MemberStatus";
