// hooks/useMessaging.js
// Drop this file into both patient/src/hooks/ and doctor/src/hooks/
// npm install socket.io-client  (in each React app)

import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function useMessaging(currentUserId, role) {
  const [conversations, setConversations]   = useState([]);
  const [activeConvId,  setActiveConvId]    = useState(null);
  const [messages,      setMessages]        = useState([]);
  const [loadingConvs,  setLoadingConvs]    = useState(false);
  const [loadingMsgs,   setLoadingMsgs]     = useState(false);
  const [typingUsers,   setTypingUsers]     = useState({});  // { convId: bool }
  const socketRef   = useRef(null);
  const typingTimer = useRef(null);

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // ── Connect socket once ──
  useEffect(() => {
    if (!currentUserId) return;
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("newMessage", (msg) => {
      // Add to open conversation
      setMessages((prev) => {
        if (prev.length && prev[0].conversationId === msg.conversationId)
          return [...prev, msg];
        return prev;
      });
      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.text || (msg.fileType === "image" ? "📷 Image" : `📎 ${msg.fileName}`),
                lastMessageAt: msg.createdAt,
                unreadDoctor:  msg.senderRole === "patient" ? (c.unreadDoctor  || 0) + 1 : c.unreadDoctor,
                unreadPatient: msg.senderRole === "doctor"  ? (c.unreadPatient || 0) + 1 : c.unreadPatient,
              }
            : c
        )
      );
    });

    socket.on("messagesRead", ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, unreadDoctor: 0, unreadPatient: 0 }
            : c
        )
      );
    });

    socket.on("typing", ({ userId, isTyping, conversationId }) => {
      if (userId !== currentUserId) {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: isTyping }));
      }
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  // ── Fetch conversations ──
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations`, { headers });
      const data = await res.json();
      setConversations(data);
    } catch (e) { console.error(e); }
    setLoadingConvs(false);
  }, []);

  useEffect(() => { if (currentUserId) fetchConversations(); }, [currentUserId, fetchConversations]);

  // ── Open a conversation ──
  const openConversation = useCallback(async (convId) => {
    if (activeConvId) socketRef.current?.emit("leaveConversation", activeConvId);
    setActiveConvId(convId);
    socketRef.current?.emit("joinConversation", convId);

    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${convId}`, { headers });
      const data = await res.json();
      setMessages(data);
      // Mark as read
      await fetch(`${API_URL}/api/messages/${convId}/read`, { method: "PATCH", headers });
      setConversations((prev) =>
        prev.map((c) =>
          c._id === convId
            ? { ...c, unreadDoctor: 0, unreadPatient: 0 }
            : c
        )
      );
    } catch (e) { console.error(e); }
    setLoadingMsgs(false);
  }, [activeConvId]);

  // ── Start a new conversation (pass doctorId + patientId) ──
  const startConversation = useCallback(async (doctorId, patientId) => {
    const res = await fetch(`${API_URL}/api/messages/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify({ doctorId, patientId }),
    });
    const conv = await res.json();
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conv._id);
      return exists ? prev : [conv, ...prev];
    });
    await openConversation(conv._id);
    return conv;
  }, [openConversation]);

  // ── Send text message ──
  const sendMessage = useCallback(async (text) => {
    if (!activeConvId || !text.trim()) return;
    await fetch(`${API_URL}/api/messages/${activeConvId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });
  }, [activeConvId]);

  // ── Send file ──
  const sendFile = useCallback(async (file) => {
    if (!activeConvId || !file) return;
    const form = new FormData();
    form.append("file", file);
    await fetch(`${API_URL}/api/messages/${activeConvId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  }, [activeConvId]);

  // ── Typing indicator ──
  const emitTyping = useCallback((isTyping) => {
    if (!activeConvId) return;
    socketRef.current?.emit("typing", { conversationId: activeConvId, userId: currentUserId, isTyping });
  }, [activeConvId, currentUserId]);

  const handleTyping = useCallback(() => {
    emitTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  }, [emitTyping]);

  const isTyping = typingUsers[activeConvId] || false;

  return {
    conversations, messages, activeConvId, loadingConvs, loadingMsgs, isTyping,
    openConversation, startConversation, sendMessage, sendFile, handleTyping,
    fetchConversations,
  };
}