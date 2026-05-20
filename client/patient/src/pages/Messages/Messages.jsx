// patient/src/pages/Messages/Messages.jsx
// Add to your patient routes: <Route path="/messages" element={<Messages />} />
// Add to Data.js: { icon: <FaEnvelope size={20}/>, text: "Messages", route: "/messages" }
// npm install socket.io-client  (in patient folder)

import { useState, useEffect, useRef } from "react";
import { useMessaging } from "../../hooks/useMessaging";
import { getUserIdFromToken } from "../../utils/auth";

/* ── Inline styles (same pattern as ChatBot.jsx) ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Merriweather:wght@700&display=swap');

  .msg-shell {
    display: flex;
    height: 100dvh;
    width: calc(100% - 280px);
    margin-left: 280px;
    background: #f5f6fa;
    font-family: 'Lato', sans-serif;
  }

  @media (max-width: 1068px) {
    .msg-shell { width: 100%; margin-left: 0; }
  }

  /* ── Sidebar: conversation list ── */
  .msg-convlist {
    width: 300px;
    min-width: 300px;
    background: #fff;
    border-right: 1px solid #eaeaea;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .msg-convlist { width: 72px; min-width: 72px; }
    .msg-convlist-name, .msg-convlist-preview, .msg-convlist-time { display: none; }
  }

  .msg-convlist-header {
    padding: 20px 16px 12px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .msg-convlist-title {
    font-family: 'Merriweather', serif;
    font-size: 18px;
    color: #2D0101;
    margin: 0;
  }

  .msg-convlist-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .msg-conv-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background .15s;
    border-left: 3px solid transparent;
  }

  .msg-conv-item:hover  { background: #fef2f2; }
  .msg-conv-item.active { background: #fef2f2; border-left-color: #e63946; }

  .msg-conv-avatar {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e63946, #c1121f);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    position: relative;
  }

  .msg-conv-unread {
    position: absolute;
    top: -4px; right: -4px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #e63946;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  .msg-conv-info { flex: 1; min-width: 0; }
  .msg-convlist-name    { font-weight: 700; font-size: 14px; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .msg-convlist-preview { font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .msg-convlist-time    { font-size: 10px; color: #bbb; white-space: nowrap; margin-left: auto; flex-shrink: 0; padding-left: 4px; }

  /* ── Main chat area ── */
  .msg-chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .msg-chat-header {
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .msg-chat-header-name { font-weight: 700; font-size: 16px; color: #1a1a1a; }
  .msg-chat-header-role { font-size: 12px; color: #e63946; margin-top: 1px; }

  .msg-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .msg-messages::-webkit-scrollbar { width: 4px; }
  .msg-messages::-webkit-scrollbar-thumb { background: #f0c0c0; border-radius: 4px; }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: msgIn .2s ease both;
  }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .msg-row--mine { flex-direction: row-reverse; }

  .msg-mini-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e63946, #c1121f);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    flex-shrink: 0;
  }

  .msg-bubble {
    max-width: min(70%, 460px);
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
  }

  .msg-bubble--theirs {
    background: #fff;
    border: 1px solid #eaeaea;
    color: #1a1a1a;
    border-bottom-left-radius: 4px;
  }

  .msg-bubble--mine {
    background: linear-gradient(135deg, #e63946, #c1121f);
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .msg-bubble-time {
    font-size: 10px;
    opacity: .55;
    margin-top: 4px;
    text-align: right;
  }

  .msg-bubble--theirs .msg-bubble-time { text-align: left; }

  .msg-bubble-read {
    font-size: 10px;
    text-align: right;
    opacity: .7;
    margin-top: 2px;
  }

  /* Image attachment */
  .msg-bubble-img {
    max-width: 220px;
    border-radius: 10px;
    display: block;
    cursor: pointer;
  }

  /* File attachment */
  .msg-file-attach {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,.15);
    font-size: 13px;
    text-decoration: none;
    color: inherit;
  }

  /* Typing dots */
  .msg-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
  .msg-typing span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #e63946;
    animation: typingBounce 1.2s infinite;
  }
  .msg-typing span:nth-child(2) { animation-delay: .2s; }
  .msg-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes typingBounce {
    0%,80%,100% { transform: translateY(0); opacity:.4; }
    40%          { transform: translateY(-5px); opacity:1; }
  }

  /* ── Input bar ── */
  .msg-input-bar {
    padding: 12px 20px;
    background: #fff;
    border-top: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .msg-file-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1.5px solid #eaeaea;
    background: #fafafa;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: border-color .15s;
    flex-shrink: 0;
  }
  .msg-file-btn:hover { border-color: #e63946; }

  .msg-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f6fa;
    border: 1.5px solid #eaeaea;
    border-radius: 24px;
    padding: 6px 14px;
    transition: border-color .15s;
    min-width: 0;
  }
  .msg-input-wrap:focus-within { border-color: #e63946; }

  .msg-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    min-width: 0;
  }
  .msg-input::placeholder { color: #bbb; }

  .msg-send-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #e63946, #c1121f);
    color: #fff;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: transform .15s, opacity .15s;
    box-shadow: 0 2px 8px rgba(230,57,70,.3);
  }
  .msg-send-btn:hover:not(:disabled)  { transform: scale(1.08); }
  .msg-send-btn:active:not(:disabled) { transform: scale(.95); }
  .msg-send-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* ── Empty state ── */
  .msg-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #ccc;
    gap: 12px;
  }
  .msg-empty-icon { font-size: 52px; }
  .msg-empty-text { font-size: 15px; }

  /* ── New conversation modal ── */
  .msg-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .msg-modal {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    width: 380px;
    max-width: 90vw;
    box-shadow: 0 8px 40px rgba(0,0,0,.15);
  }

  .msg-modal h3 { font-family: 'Merriweather', serif; color: #2D0101; margin: 0 0 16px; font-size: 18px; }

  .msg-modal input {
    width: 100%;
    border: 1.5px solid #eaeaea;
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    outline: none;
    margin-bottom: 12px;
    box-sizing: border-box;
    transition: border-color .15s;
  }
  .msg-modal input:focus { border-color: #e63946; }

  .msg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

  .msg-btn-cancel {
    padding: 8px 18px;
    border: 1.5px solid #eaeaea;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }

  .msg-btn-start {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #e63946, #c1121f);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
  }
`;

function injectCSS() {
  if (document.getElementById("msg-styles")) return;
  const tag = document.createElement("style");
  tag.id = "msg-styles";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

// ─────────────────────────────────────────────
const Messages = () => {
  injectCSS();

  const currentUserId = getUserIdFromToken();
  const {
    conversations, messages, activeConvId, loadingConvs, loadingMsgs, isTyping,
    openConversation, startConversation, sendMessage, sendFile, handleTyping,
  } = useMessaging(currentUserId, "patient");

  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [doctorId, setDoctorId] = useState("");   // patient types doctor's ID
  const fileInputRef = useRef(null);
  const bottomRef    = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text);
    setText("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) await sendFile(file);
    e.target.value = "";
  };

  const handleStart = async () => {
    if (!doctorId.trim()) return;
    await startConversation(doctorId.trim(), currentUserId);
    setShowModal(false);
    setDoctorId("");
  };

  // Determine other party name from conversation metadata
  // In real app, populate with user names from backend
  const getConvLabel = (conv) => conv.doctorName || conv.doctorId?.slice(-6) || "Doctor";

  const activeConv = conversations.find((c) => c._id === activeConvId);

  return (
    <div className="msg-shell">

      {/* ── Conversation list ── */}
      <div className="msg-convlist">
        <div className="msg-convlist-header">
          <h2 className="msg-convlist-title">Inbox</h2>
          <button
            title="New conversation"
            style={{ border:"none", background:"none", cursor:"pointer", fontSize:20, color:"#e63946" }}
            onClick={() => setShowModal(true)}
          >＋</button>
        </div>
        <div className="msg-convlist-scroll">
          {loadingConvs && <p style={{ padding:"16px", color:"#bbb", fontSize:13 }}>Loading…</p>}
          {conversations.map((conv) => {
            const label    = getConvLabel(conv);
            const unread   = conv.unreadPatient || 0;
            const isActive = conv._id === activeConvId;
            return (
              <div
                key={conv._id}
                className={`msg-conv-item ${isActive ? "active" : ""}`}
                onClick={() => openConversation(conv._id)}
              >
                <div className="msg-conv-avatar">
                  {initials(label)}
                  {unread > 0 && <span className="msg-conv-unread">{unread > 9 ? "9+" : unread}</span>}
                </div>
                <div className="msg-conv-info">
                  <div className="msg-convlist-name">{label}</div>
                  <div className="msg-convlist-preview">{conv.lastMessage || "Start a conversation"}</div>
                </div>
                <div className="msg-convlist-time">{formatTime(conv.lastMessageAt)}</div>
              </div>
            );
          })}
          {!loadingConvs && conversations.length === 0 && (
            <p style={{ padding:"24px 16px", color:"#bbb", fontSize:13, textAlign:"center" }}>
              No conversations yet.<br/>Tap + to message your doctor.
            </p>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="msg-chat-area">
        {!activeConvId ? (
          <div className="msg-empty">
            <div className="msg-empty-icon">💬</div>
            <div className="msg-empty-text">Select a conversation to start chatting</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="msg-chat-header">
              <div className="msg-conv-avatar" style={{ width:38, height:38, fontSize:14 }}>
                {initials(getConvLabel(activeConv || {}))}
              </div>
              <div>
                <div className="msg-chat-header-name">{getConvLabel(activeConv || {})}</div>
                <div className="msg-chat-header-role">Your Doctor</div>
              </div>
            </div>

            {/* Messages */}
            <div className="msg-messages">
              {loadingMsgs && <p style={{ textAlign:"center", color:"#bbb", fontSize:13 }}>Loading messages…</p>}
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg._id} className={`msg-row ${isMine ? "msg-row--mine" : ""}`}>
                    {!isMine && (
                      <div className="msg-mini-avatar">Dr</div>
                    )}
                    <div className={`msg-bubble ${isMine ? "msg-bubble--mine" : "msg-bubble--theirs"}`}>
                      {msg.fileType === "image" && (
                        <img
                          src={`${API_URL}${msg.fileUrl}`}
                          alt="attachment"
                          className="msg-bubble-img"
                          onClick={() => window.open(`${API_URL}${msg.fileUrl}`, "_blank")}
                        />
                      )}
                      {msg.fileType === "file" && (
                        <a
                          href={`${API_URL}${msg.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="msg-file-attach"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}
                      {msg.text && <span>{msg.text}</span>}
                      <div className="msg-bubble-time">{formatTime(msg.createdAt)}</div>
                      {isMine && (
                        <div className="msg-bubble-read">
                          {msg.readBy?.length > 1 ? "✓✓ Seen" : "✓ Sent"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="msg-row">
                  <div className="msg-mini-avatar">Dr</div>
                  <div className="msg-bubble msg-bubble--theirs">
                    <div className="msg-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="msg-input-bar">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display:"none" }}
                onChange={handleFile}
              />
              <button className="msg-file-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
                📎
              </button>
              <div className="msg-input-wrap">
                <input
                  className="msg-input"
                  placeholder="Type a message…"
                  value={text}
                  onChange={(e) => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
              </div>
              <button className="msg-send-btn" onClick={handleSend} disabled={!text.trim()}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── New Conversation Modal ── */}
      {showModal && (
        <div className="msg-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="msg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Message a Doctor</h3>
            <input
              placeholder="Enter Doctor ID"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
            <p style={{ fontSize:12, color:"#999", marginBottom:12 }}>
              Your doctor will share their ID with you.
            </p>
            <div className="msg-modal-actions">
              <button className="msg-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="msg-btn-start" onClick={handleStart}>Start Chat</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Messages;