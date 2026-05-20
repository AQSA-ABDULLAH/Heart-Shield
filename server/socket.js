// socket.js — attach Socket.io to your existing HTTP server
const { Server } = require("socket.io");

/**
 * Call this in your server entry point:
 *   const { initSocket } = require('./socket');
 *   initSocket(httpServer, app);
 */
function initSocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.PATIENT_CLIENT_URL || "http://localhost:3001",
        process.env.DOCTOR_CLIENT_URL  || "http://localhost:3002",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Make io accessible inside Express route handlers via req.app.get("io")
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Client joins a conversation room to receive live messages
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
    });

    // Typing indicators
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      socket.to(conversationId).emit("typing", { userId, isTyping });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };