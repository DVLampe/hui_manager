/*
  Warnings:

  - You are about to drop the column `cycle` on the `HuiGroup` table. All the data in the column will be lost.
  - You are about to drop the column `rules` on the `HuiGroup` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HuiFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "HuiGroup" DROP COLUMN "cycle",
DROP COLUMN "rules",
ADD COLUMN     "frequency" "HuiFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "numberOfPeriods" INTEGER NOT NULL DEFAULT 0;
