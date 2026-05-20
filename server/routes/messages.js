const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ── File upload config (local disk; swap for S3 in production) ──
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// ── Auth middleware (reuse your existing verifyToken) ──
// Replace this with your actual auth middleware import
const verifyToken = require("../middleware/verifyToken");


// ─────────────────────────────────────────────
// GET /api/messages/conversations
// Returns all conversations for the logged-in user
// ─────────────────────────────────────────────
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const filter = role === "doctor" ? { doctorId: userId } : { patientId: userId };

    const conversations = await Conversation.find(filter).sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────
// POST /api/messages/conversations
// Start or get existing conversation between doctor & patient
// Body: { doctorId, patientId }
// ─────────────────────────────────────────────
router.post("/conversations", verifyToken, async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;
    if (!doctorId || !patientId)
      return res.status(400).json({ message: "doctorId and patientId required" });

    let conv = await Conversation.findOne({ doctorId, patientId });
    if (!conv) conv = await Conversation.create({ doctorId, patientId });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────
// GET /api/messages/:conversationId
// Fetch messages for a conversation (paginated)
// Query: ?page=1&limit=40
// ─────────────────────────────────────────────
router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return oldest-first for the UI
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────
// POST /api/messages/:conversationId
// Send a text message
// Body: { text }
// ─────────────────────────────────────────────
router.post("/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, role } = req.user;
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "text is required" });

    const msg = await Message.create({
      conversationId,
      senderId: userId,
      senderRole: role,
      text: text.trim(),
      readBy: [userId],
    });

    // Update conversation summary
    const unreadField = role === "doctor" ? "unreadPatient" : "unreadDoctor";
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
      $inc: { [unreadField]: 1 },
    });

    // Emit via Socket.io (attached to req.app)
    req.app.get("io").to(conversationId).emit("newMessage", msg);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────
// POST /api/messages/:conversationId/upload
// Send a file / image attachment
// Form field: "file"
// ─────────────────────────────────────────────
router.post("/:conversationId/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, role } = req.user;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const isImage = req.file.mimetype.startsWith("image/");
    const fileUrl = `/uploads/${req.file.filename}`;   // serve statically

    const msg = await Message.create({
      conversationId,
      senderId: userId,
      senderRole: role,
      text: "",
      fileUrl,
      fileName: req.file.originalname,
      fileType: isImage ? "image" : "file",
      readBy: [userId],
    });

    const unreadField = role === "doctor" ? "unreadPatient" : "unreadDoctor";
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: isImage ? "📷 Image" : `📎 ${req.file.originalname}`,
      lastMessageAt: new Date(),
      $inc: { [unreadField]: 1 },
    });

    req.app.get("io").to(conversationId).emit("newMessage", msg);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────────────────────
// PATCH /api/messages/:conversationId/read
// Mark all messages in a conversation as read by current user
// ─────────────────────────────────────────────
router.patch("/:conversationId/read", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, role } = req.user;

    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    const resetField = role === "doctor" ? { unreadDoctor: 0 } : { unreadPatient: 0 };
    await Conversation.findByIdAndUpdate(conversationId, resetField);

    req.app.get("io").to(conversationId).emit("messagesRead", { userId, conversationId });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;