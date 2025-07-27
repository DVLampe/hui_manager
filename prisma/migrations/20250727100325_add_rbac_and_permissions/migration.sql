/*
  Warnings:

  - The values [MANAGER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `managerId` on the `HuiGroup` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `HuiGroup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('MANAGE', 'VIEW');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "HuiGroup" DROP CONSTRAINT "HuiGroup_managerId_fkey";

-- DropForeignKey
ALTER TABLE "MemberPeriodContribution" DROP CONSTRAINT "MemberPeriodContribution_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_huiGroupId_fkey";

-- DropIndex
DROP INDEX "HuiGroup_managerId_idx";

-- AlterTable
ALTER TABLE "HuiGroup" DROP COLUMN "managerId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "HuiPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "permission" "PermissionType" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HuiPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HuiPermission_userId_idx" ON "HuiPermission"("userId");

-- CreateIndex
CREATE INDEX "HuiPermission_groupId_idx" ON "HuiPermission"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "HuiPermission_userId_groupId_key" ON "HuiPermission"("userId", "groupId");

-- CreateIndex
CREATE INDEX "HuiGroup_ownerId_idx" ON "HuiGroup"("ownerId");

-- AddForeignKey
ALTER TABLE "HuiGroup" ADD CONSTRAINT "HuiGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuiPermission" ADD CONSTRAINT "HuiPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuiPermission" ADD CONSTRAINT "HuiPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HuiGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_huiGroupId_fkey" FOREIGN KEY ("huiGroupId") REFERENCES "HuiGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPeriodContribution" ADD CONSTRAINT "MemberPeriodContribution_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
