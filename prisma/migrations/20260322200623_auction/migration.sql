-- CreateEnum
CREATE TYPE "public"."AuctionStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

-- CreateTable
CREATE TABLE "public"."Auction" (
    "id" TEXT NOT NULL,
    "huiGroupId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "public"."AuctionStatus" NOT NULL DEFAULT 'PENDING',
    "bidStep" DECIMAL(10,2) NOT NULL,
    "potAmount" DECIMAL(12,2),
    "durationSeconds" INTEGER,
    "roundLabel" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "winningBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auction_paymentId_key" ON "public"."Auction"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_winningBidId_key" ON "public"."Auction"("winningBidId");

-- CreateIndex
CREATE INDEX "Auction_huiGroupId_idx" ON "public"."Auction"("huiGroupId");

-- CreateIndex
CREATE INDEX "Auction_status_idx" ON "public"."Auction"("status");

-- CreateIndex
CREATE INDEX "Auction_paymentId_idx" ON "public"."Auction"("paymentId");

-- CreateIndex
CREATE INDEX "Bid_auctionId_idx" ON "public"."Bid"("auctionId");

-- CreateIndex
CREATE INDEX "Bid_userId_idx" ON "public"."Bid"("userId");

-- CreateIndex
CREATE INDEX "Bid_amount_idx" ON "public"."Bid"("amount");

-- AddForeignKey
ALTER TABLE "public"."Auction" ADD CONSTRAINT "Auction_huiGroupId_fkey" FOREIGN KEY ("huiGroupId") REFERENCES "public"."HuiGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Auction" ADD CONSTRAINT "Auction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Auction" ADD CONSTRAINT "Auction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Auction" ADD CONSTRAINT "Auction_winningBidId_fkey" FOREIGN KEY ("winningBidId") REFERENCES "public"."Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "public"."Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
