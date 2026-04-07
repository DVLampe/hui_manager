-- AlterTable
ALTER TABLE "public"."Auction"
ADD COLUMN "startPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "maxPrice" DECIMAL(12,2);

-- Backfill existing auctions where startPrice can be inferred from bidStep
UPDATE "public"."Auction"
SET "startPrice" = "bidStep";

-- Drop temporary default used for migration safety
ALTER TABLE "public"."Auction"
ALTER COLUMN "startPrice" DROP DEFAULT;
