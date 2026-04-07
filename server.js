import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const AUCTION_STATUS = { PENDING: "PENDING", ACTIVE: "ACTIVE", ENDED: "ENDED" };
const ANTI_SNIPING_THRESHOLD_MS = 10_000;
const ANTI_SNIPING_EXTENSION_MS = 30_000;
const AUCTION_TICK_MS = 5_000;

const auctionRoom = (huiId) => `auction-${huiId}`;

const serializeBid = (bid) => ({
  id: bid.id,
  userId: bid.userId,
  user: bid.user ? { id: bid.user.id, name: bid.user.name } : null,
  amount: Number(bid.amount),
  createdAt: bid.createdAt,
});

const resolveMinNextBid = (auction, highestAmount = null) => {
  const baseMin = highestAmount !== null ? highestAmount + Number(auction.bidStep) : Number(auction.startPrice);
  if (auction.maxPrice === null || auction.maxPrice === undefined) return baseMin;
  return Math.min(baseMin, Number(auction.maxPrice));
};

const mapAuctionState = (auction) => {
  if (!auction) return null;
  const sortedBids = [...auction.bids].sort((a, b) => {
    const amountDiff = Number(b.amount) - Number(a.amount);
    if (amountDiff !== 0) return amountDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  const highest = sortedBids[0] ? serializeBid(sortedBids[0]) : null;
  const minNextBid = resolveMinNextBid(auction, highest ? Number(highest.amount) : null);

  return {
    id: auction.id,
    huiGroupId: auction.huiGroupId,
    status: auction.status,
    startPrice: Number(auction.startPrice),
    maxPrice: auction.maxPrice !== null && auction.maxPrice !== undefined ? Number(auction.maxPrice) : null,
    bidStep: Number(auction.bidStep),
    potAmount: auction.potAmount ? Number(auction.potAmount) : null,
    durationSeconds: auction.durationSeconds,
    roundLabel: auction.roundLabel,
    startTime: auction.startTime,
    endTime: auction.endTime,
    createdBy: auction.createdBy,
    winningBidId: auction.winningBidId,
    winningBid: auction.winningBid ? serializeBid(auction.winningBid) : null,
    bids: auction.bids.map(serializeBid),
    highestBid: highest,
    minNextBid,
  };
};

const mapHistoryItem = (auction) => ({
  id: auction.id,
  roundLabel: auction.roundLabel,
  endedAt: auction.endTime || auction.updatedAt,
  potAmount: auction.potAmount ? Number(auction.potAmount) : null,
  winningBid: auction.winningBid
    ? {
        id: auction.winningBid.id,
        amount: Number(auction.winningBid.amount),
        user: auction.winningBid.user ? { id: auction.winningBid.user.id, name: auction.winningBid.user.name } : null,
      }
    : null,
});

async function getActiveAuction(huiId) {
  return prisma.auction.findFirst({
    where: { huiGroupId: huiId, status: { in: [AUCTION_STATUS.ACTIVE, AUCTION_STATUS.PENDING] } },
    orderBy: { createdAt: "desc" },
    include: {
      bids: { include: { user: { select: { id: true, name: true } } } },
      winningBid: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

async function getAuctionHistory(huiId) {
  const auctions = await prisma.auction.findMany({
    where: { huiGroupId: huiId, status: AUCTION_STATUS.ENDED },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      winningBid: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  return auctions.map(mapHistoryItem);
}

async function emitAuctionState(huiId) {
  const activeAuction = await getActiveAuction(huiId);
  io.to(auctionRoom(huiId)).emit("auction:state", { auction: mapAuctionState(activeAuction) });
}

async function emitAuctionHistory(huiId) {
  io.to(auctionRoom(huiId)).emit("auction:history", await getAuctionHistory(huiId));
}

async function finalizeAuction(auctionId, endedBy = null, txClient = prisma) {
  const auction = await txClient.auction.findUnique({ where: { id: auctionId } });
  if (!auction || auction.status === AUCTION_STATUS.ENDED) return null;

  const winningBid = await txClient.bid.findFirst({
    where: { auctionId },
    orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { id: true, name: true } } },
  });

  const updatedAuction = await txClient.auction.update({
    where: { id: auctionId },
    data: {
      status: AUCTION_STATUS.ENDED,
      endTime: new Date(),
      winningBidId: winningBid?.id || null,
    },
    include: {
      bids: { include: { user: { select: { id: true, name: true } } } },
      winningBid: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  const huiId = updatedAuction.huiGroupId;
  io.to(auctionRoom(huiId)).emit("auction:ended", {
    auction: mapAuctionState(updatedAuction),
    reason: endedBy === "timer" ? "timer" : endedBy === "max-price" ? "max-price" : "manual",
  });
  await emitAuctionState(huiId);
  await emitAuctionHistory(huiId);
  return { updatedAuction, winningBid };
}

async function validateBidder(huiId, userId) {
  const hui = await prisma.huiGroup.findUnique({
    where: { id: huiId },
    include: {
      members: true,
      payments: { select: { potTakerMemberId: true } },
    },
  });

  if (!hui) throw new Error("Không tìm thấy hụi.");
  if (hui.status !== "ACTIVE") throw new Error("Hụi không ở trạng thái hoạt động.");

  const member = hui.members.find((m) => m.userId === userId);
  if (!member) throw new Error("Chỉ thành viên hụi sống mới được đấu giá.");

  const takenMemberIds = new Set(hui.payments.map((p) => p.potTakerMemberId).filter(Boolean));
  if (takenMemberIds.has(member.id)) throw new Error("Bạn đã hốt hụi trước đó và không thể đấu giá tiếp.");

  return { hui, member };
}

setInterval(async () => {
  const now = new Date();
  const expiredAuctions = await prisma.auction.findMany({
    where: { status: AUCTION_STATUS.ACTIVE, endTime: { lte: now } },
  });

  for (const auction of expiredAuctions) {
    await finalizeAuction(auction.id, "timer");
  }
}, AUCTION_TICK_MS);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // --- Chat events ---
  socket.on("joinRoom", async (huiId) => {
    socket.join(huiId);
    console.log(`Socket ${socket.id} joined room ${huiId}`);

    try {
      const messages = await prisma.chatMessage.findMany({
        where: { chatRoom: { huiGroupId: huiId } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      });
      socket.emit("messageHistory", messages);
    } catch (error) {
      console.error(`Failed to fetch message history for room ${huiId}:`, error);
    }
  });

  socket.on("sendMessage", async (data) => {
    const { huiId, userId, content, fileUrl, fileName, fileType, fileSize } = data;

    if (!userId || !huiId || (!content && !fileUrl)) {
      console.log("Invalid message data received:", data);
      return;
    }

    try {
      let chatRoom = await prisma.chatRoom.findUnique({
        where: { huiGroupId: huiId },
      });

      if (!chatRoom) {
        chatRoom = await prisma.chatRoom.create({
          data: { huiGroupId: huiId },
        });
      }

      const newMessage = await prisma.chatMessage.create({
        data: {
          content,
          userId,
          chatRoomId: chatRoom.id,
          fileUrl,
          fileName,
          fileType,
          fileSize,
        },
        include: { user: { select: { name: true } } },
      });

      io.to(huiId).emit("receiveMessage", newMessage);

      try {
        const group = await prisma.huiGroup.findUnique({
          where: { id: huiId },
          include: {
            members: {
              select: {
                userId: true,
                user: {
                  select: { notificationPreferences: true },
                },
              },
            },
          },
        });

        if (group && group.members) {
          const recipients = group.members.filter(
            (member) =>
              member.userId &&
              member.userId !== userId &&
              member.user?.notificationPreferences?.notifyGeneral !== false,
          );

          const notificationData = recipients.map((recipient) => ({
            userId: recipient.userId,
            title: `Tin nhắn mới trong "${group.name}"`,
            message: `${newMessage.user.name}: ${content || "Đã gửi một tệp"}`,
            type: "NEW_MESSAGE",
            link: `/hui/${huiId}`,
          }));

          if (notificationData.length > 0) {
            await prisma.notification.createMany({
              data: notificationData,
            });
          }
        }
      } catch (notificationError) {
        console.error("Failed to create chat notifications:", notificationError);
      }
    } catch (error) {
      console.error("Failed to save or broadcast message:", error);
    }
  });

  // --- Auction events ---
  socket.on("auction:join", async ({ huiId }) => {
    if (!huiId) return;
    socket.join(auctionRoom(huiId));
    const [auction, history] = await Promise.all([getActiveAuction(huiId), getAuctionHistory(huiId)]);
    socket.emit("auction:state", { auction: mapAuctionState(auction) });
    socket.emit("auction:history", history);
  });

  socket.on("auction:start", async (payload) => {
    const { huiId, userId, bidStep, startPrice, maxPrice, durationSeconds, roundLabel } = payload || {};

    if (!huiId || !userId || bidStep === undefined || startPrice === undefined) {
      socket.emit("auction:error", { message: "Thiếu dữ liệu khởi tạo đấu giá." });
      return;
    }

    try {
      const [hui, userPermissions, user] = await Promise.all([
        prisma.huiGroup.findUnique({ where: { id: huiId }, include: { members: true } }),
        prisma.huiPermission.findFirst({
          where: { groupId: huiId, userId, permission: 'MANAGE' },
          select: { id: true },
        }),
        prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
      ]);

      if (!hui) {
        socket.emit("auction:error", { message: "Không tìm thấy hụi." });
        return;
      }

      const isOwner = hui.ownerId === userId;
      const isAdmin = user?.role === 'ADMIN';
      const isManager = !!userPermissions;

      if (!isOwner && !isManager && !isAdmin) {
        socket.emit("auction:error", { message: "Chỉ chủ hụi hoặc người quản lý được phép mở đấu giá." });
        return;
      }

      const existing = await getActiveAuction(huiId);
      if (existing) {
        socket.emit("auction:error", { message: "Đang có đấu giá hoạt động." });
        return;
      }

      const bidStepValue = Number(bidStep);
      const startPriceValue = Number(startPrice);
      const maxPriceValue = maxPrice !== null && maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : null;
      const durationValue = durationSeconds !== null && durationSeconds !== undefined && durationSeconds !== "" ? Number(durationSeconds) : null;

      if (!Number.isFinite(bidStepValue) || bidStepValue <= 0) {
        socket.emit("auction:error", { message: "Bước giá phải lớn hơn 0." });
        return;
      }

      if (!Number.isFinite(startPriceValue) || startPriceValue <= 0) {
        socket.emit("auction:error", { message: "Giá khởi điểm phải lớn hơn 0." });
        return;
      }

      if (maxPriceValue !== null && (!Number.isFinite(maxPriceValue) || maxPriceValue < startPriceValue)) {
        socket.emit("auction:error", { message: "Giá tối đa phải lớn hơn hoặc bằng giá khởi điểm." });
        return;
      }

      if (durationValue !== null && (!Number.isFinite(durationValue) || durationValue <= 0)) {
        socket.emit("auction:error", { message: "Thời gian đấu giá phải lớn hơn 0 hoặc để trống." });
        return;
      }

      const potAmount = hui.amount ? Number(hui.amount) * (hui.totalMembers || hui.members.length || 0) : null;

      const newAuction = await prisma.auction.create({
        data: {
          huiGroupId: huiId,
          status: AUCTION_STATUS.ACTIVE,
          startPrice: startPriceValue,
          maxPrice: maxPriceValue,
          bidStep: bidStepValue,
          durationSeconds: durationValue,
          roundLabel: roundLabel || `Kỳ ${hui.currentCycle || ""}`.trim(),
          startTime: new Date(),
          endTime: durationValue ? new Date(Date.now() + durationValue * 1000) : null,
          potAmount,
          createdBy: userId,
        },
      });

      socket.join(auctionRoom(huiId));
      await emitAuctionState(huiId);
      await emitAuctionHistory(huiId);
      io.to(auctionRoom(huiId)).emit("auction:started", { auctionId: newAuction.id });
    } catch (error) {
      console.error("auction:start error", error);
      socket.emit("auction:error", { message: error.message || "Không thể tạo đấu giá." });
    }
  });

  socket.on("auction:bid", async (payload) => {
    const { huiId, auctionId, userId, amount } = payload || {};
    if (!huiId || !auctionId || !userId || amount === undefined) {
      socket.emit("auction:error", { message: "Thiếu thông tin đặt giá." });
      return;
    }

    try {
      await validateBidder(huiId, userId);
      const amountNumber = Number(amount);

      await prisma.$transaction(async (tx) => {
        const auction = await tx.auction.findUnique({ where: { id: auctionId } });
        if (!auction || auction.huiGroupId !== huiId) throw new Error("Đấu giá không tồn tại.");
        if (auction.status !== AUCTION_STATUS.ACTIVE) throw new Error("Đấu giá đã kết thúc hoặc chưa bắt đầu.");
        if (auction.endTime && auction.endTime <= new Date()) {
          await finalizeAuction(auctionId, "timer", tx);
          throw new Error("Đấu giá đã hết thời gian.");
        }

        const highest = await tx.bid.findFirst({
          where: { auctionId },
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          select: { amount: true },
        });
        const highestAmount = highest ? Number(highest.amount) : null;
        if (auction.maxPrice !== null && auction.maxPrice !== undefined && highestAmount !== null && highestAmount >= Number(auction.maxPrice)) {
          await finalizeAuction(auctionId, "max-price", tx);
          throw new Error("Đấu giá đã chạm giá tối đa và được tự động kết thúc.");
        }

        const minNextBid = resolveMinNextBid(auction, highestAmount);

        if (auction.maxPrice !== null && auction.maxPrice !== undefined && amountNumber > Number(auction.maxPrice)) {
          throw new Error(`Giá không được vượt quá mức tối đa ${Number(auction.maxPrice).toLocaleString('vi-VN')}.`);
        }

        if (amountNumber < minNextBid) throw new Error(`Giá phải từ ${minNextBid.toLocaleString('vi-VN')} trở lên.`);

        const lastUserBid = await tx.bid.findFirst({
          where: { auctionId, userId },
          orderBy: { createdAt: "desc" },
          select: { amount: true },
        });
        if (lastUserBid && amountNumber < Number(lastUserBid.amount)) {
          throw new Error("Không thể giảm giá so với lần trước.");
        }

        await tx.bid.create({
          data: { auctionId, userId, amount: amountNumber },
        });

        if (auction.maxPrice !== null && auction.maxPrice !== undefined && amountNumber >= Number(auction.maxPrice)) {
          await finalizeAuction(auctionId, "max-price", tx);
          return;
        }

        if (auction.endTime) {
          const diff = auction.endTime.getTime() - Date.now();
          if (diff <= ANTI_SNIPING_THRESHOLD_MS) {
            await tx.auction.update({
              where: { id: auctionId },
              data: { endTime: new Date(Date.now() + ANTI_SNIPING_EXTENSION_MS) },
            });
          }
        }
      });

      await emitAuctionState(huiId);
    } catch (error) {
      console.error("auction:bid error", error);
      socket.emit("auction:error", { message: error.message || "Không thể đặt giá." });
    }
  });

  socket.on("auction:end", async (payload) => {
    const { huiId, auctionId, userId } = payload || {};
    if (!huiId || !auctionId || !userId) {
      socket.emit("auction:error", { message: "Thiếu thông tin." });
      return;
    }

    try {
      const hui = await prisma.huiGroup.findUnique({ where: { id: huiId } });
      if (!hui) {
        socket.emit("auction:error", { message: "Không tìm thấy hụi." });
        return;
      }
      if (hui.ownerId !== userId) {
        socket.emit("auction:error", { message: "Chỉ chủ hụi được phép kết thúc đấu giá." });
        return;
      }
      await finalizeAuction(auctionId, userId);
    } catch (error) {
      console.error("auction:end error", error);
      socket.emit("auction:error", { message: error.message || "Không thể kết thúc đấu giá." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
