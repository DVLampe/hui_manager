import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your frontend's URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("joinRoom", async (huiId) => {
    socket.join(huiId);
    console.log(`Socket ${socket.id} joined room ${huiId}`);

    try {
      const messages = await prisma.chatMessage.findMany({
        where: { chatRoom: { huiGroupId: huiId } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      });
      socket.emit('messageHistory', messages);
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
    } catch (error) {
      console.error("Failed to save or broadcast message:", error);
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
