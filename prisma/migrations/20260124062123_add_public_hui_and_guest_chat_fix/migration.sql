/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `HuiGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."HuiGroup" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HuiGroup_publicId_key" ON "public"."HuiGroup"("publicId");
