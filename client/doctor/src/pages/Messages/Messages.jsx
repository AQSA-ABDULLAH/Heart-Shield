// doctor/src/pages/Messages/Messages.jsx
// Add to your doctor routes: <Route path="/messages" element={<Messages />} />
// npm install socket.io-client  (in doctor folder)

import { useState, useEffect, useRef } from "react";
import { useMessaging } from "../../hooks/useMessaging";
// Replace with your doctor app's auth utility
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || payload._id;
  } catch { return null; }
};

/* ── Styles (dark professional theme for doctor side) ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');

  .dr-msg-shell {
    display: flex;
    height: 100dvh;
    width: calc(100% - 280px);
    margin-left: 280px;
    background: #f0f2f5;
    font-family: 'Source Sans 3', sans-serif;
  }

  @media (max-width: 1068px) {
    .dr-msg-shell { width: 100%; margin-left: 0; }
  }

  /* ── Patient list ── */
  .dr-convlist {
    width: 320px;
    min-width: 320px;
    background: #1a1a2e;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .dr-convlist { width: 64px; min-width: 64px; }
    .dr-conv-name, .dr-conv-preview, .dr-conv-time { display: none; }
  }

  .dr-convlist-header {
    padding: 22px 18px 14px;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }

  .dr-convlist-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #fff;
    margin: 0 0 4px;
  }

  .dr-convlist-sub { font-size: 12px; color: #8888aa; }

  .dr-convlist-scroll { flex: 1; overflow-y: auto; padding: 8px 0; }
  .dr-convlist-scroll::-webkit-scrollbar { width: 3px; }
  .dr-convlist-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); }

  .dr-conv-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    cursor: pointer;
    transition: background .15s;
    border-left: 3px solid transparent;
  }

  .dr-conv-item:hover  { background: rgba(255,255,255,.05); }
  .dr-conv-item.active { background: rgba(255,255,255,.08); border-left-color: #e63946; }

  .dr-conv-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2D0101, #e63946);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px;
    flex-shrink: 0;
    position: relative;
  }

  .dr-conv-unread {
    position: absolute;
    top: -3px; right: -3px;
    width: 17px; height: 17px;
    border-radius: 50%;
    background: #e63946;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #1a1a2e;
  }

  .dr-conv-info { flex: 1; min-width: 0; }
  .dr-conv-name    { font-weight: 600; font-size: 14px; color: #e8e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dr-conv-preview { font-size: 12px; color: #6666aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .dr-conv-time    { font-size: 10px; color: #44445a; white-space: nowrap; flex-shrink: 0; }

  /* ── Chat ── */
  .dr-chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .dr-chat-header {
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }

  .dr-chat-header-name { font-weight: 700; font-size: 16px; color: #1a1a1a; }
  .dr-chat-header-sub  { font-size: 12px; color: #888; margin-top: 1px; }

  .dr-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .dr-messages::-webkit-scrollbar { width: 4px; }
  .dr-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

  .dr-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: drIn .2s ease both;
  }

  @keyframes drIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dr-row--mine { flex-direction: row-reverse; }

  .dr-mini-av {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #e0e4ef;
    color: #555;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    flex-shrink: 0;
  }

  .dr-bubble {
    max-width: min(68%, 460px);
    padding: 10px 15px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.55;
    word-break: break-word;
  }

  .dr-bubble--theirs {
    background: #fff;
    border: 1px solid #e8e8e8;
    color: #1a1a1a;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,.05);
  }

  .dr-bubble--mine {
    background: #1a1a2e;
    color: #e8e8f8;
    border-bottom-right-radius: 4px;
  }

  .dr-bubble-time {
    font-size: 10px;
    opacity: .5;
    margin-top: 4px;
    text-align: right;
  }

  .dr-bubble--theirs .dr-bubble-time { text-align: left; }

  .dr-read {
    font-size: 10px;
    text-align: right;
    opacity: .6;
    margin-top: 2px;
  }

  .dr-img { max-width: 200px; border-radius: 10px; display: block; cursor: pointer; }

  .dr-file-link {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,.1);
    text-decoration: none;
    color: inherit;
    font-size: 13px;
  }

  .dr-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
  .dr-typing span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #aaa;
    animation: drBounce 1.2s infinite;
  }
  .dr-typing span:nth-child(2) { animation-delay: .2s; }
  .dr-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes drBounce {
    0%,80%,100% { transform: translateY(0); opacity:.4; }
    40%          { transform: translateY(-5px); opacity:1; }
  }

  /* ── Input ── */
  .dr-input-bar {
    padding: 12px 22px;
    background: #fff;
    border-top: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .dr-file-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1.5px solid #e0e0e0;
    background: #f8f8f8;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .dr-file-btn:hover { border-color: #1a1a2e; }

  .dr-input-wrap {
    flex: 1;
    display: flex;
    background: #f5f6fa;
    border: 1.5px solid #e8e8e8;
    border-radius: 24px;
    padding: 7px 16px;
    transition: border-color .15s;
    min-width: 0;
  }
  .dr-input-wrap:focus-within { border-color: #1a1a2e; }

  .dr-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    min-width: 0;
  }
  .dr-input::placeholder { color: #bbb; }

  .dr-send-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: none;
    background: #1a1a2e;
    color: #fff;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: transform .15s, opacity .15s;
    box-shadow: 0 2px 8px rgba(26,26,46,.3);
  }
  .dr-send-btn:hover:not(:disabled)  { transform: scale(1.08); background: #2D0101; }
  .dr-send-btn:active:not(:disabled) { transform: scale(.95); }
  .dr-send-btn:disabled { opacity: .35; cursor: not-allowed; }

  .dr-empty {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #bbb; gap: 12px;
  }
  .dr-empty-icon { font-size: 52px; }
  .dr-empty-text { font-size: 15px; }
`;

function injectCSS() {
  if (document.getElementById("dr-msg-styles")) return;
  const tag = document.createElement("style");
  tag.id = "dr-msg-styles";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

// ─────────────────────────────────────────────
const DoctorMessages = () => {
  injectCSS();

  const currentUserId = getUserIdFromToken();
  const {
    conversations, messages, activeConvId, loadingConvs, loadingMsgs, isTyping,
    openConversation, sendMessage, sendFile, handleTyping,
  } = useMessaging(currentUserId, "doctor");

  const [text, setText] = useState("");
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

  const getPatientLabel = (conv) => conv.patientName || `Patient ${conv.patientId?.slice(-6)}`;
  const activeConv = conversations.find((c) => c._id === activeConvId);

  return (
    <div className="dr-msg-shell">

      {/* ── Patient list ── */}
      <div className="dr-convlist">
        <div className="dr-convlist-header">
          <h2 className="dr-convlist-title">Messages</h2>
          <p className="dr-convlist-sub">{conversations.length} patient{conversations.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="dr-convlist-scroll">
          {loadingConvs && <p style={{ padding:"16px", color:"#44445a", fontSize:13 }}>Loading…</p>}
          {conversations.map((conv) => {
            const label    = getPatientLabel(conv);
            const unread   = conv.unreadDoctor || 0;
            const isActive = conv._id === activeConvId;
            return (
              <div
                key={conv._id}
                className={`dr-conv-item ${isActive ? "active" : ""}`}
                onClick={() => openConversation(conv._id)}
              >
                <div className="dr-conv-avatar">
                  {initials(label)}
                  {unread > 0 && <span className="dr-conv-unread">{unread > 9 ? "9+" : unread}</span>}
                </div>
                <div className="dr-conv-info">
                  <div className="dr-conv-name">{label}</div>
                  <div className="dr-conv-preview">{conv.lastMessage || "No messages yet"}</div>
                </div>
                <div className="dr-conv-time">{formatTime(conv.lastMessageAt)}</div>
              </div>
            );
          })}
          {!loadingConvs && conversations.length === 0 && (
            <p style={{ padding:"24px 18px", color:"#44445a", fontSize:13, textAlign:"center", lineHeight:1.6 }}>
              No patient conversations yet.<br/>Patients can initiate a chat from their app.
            </p>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="dr-chat-area">
        {!activeConvId ? (
          <div className="dr-empty">
            <div className="dr-empty-icon">🩺</div>
            <div className="dr-empty-text">Select a patient to view messages</div>
          </div>
        ) : (
          <>
            <div className="dr-chat-header">
              <div className="dr-conv-avatar" style={{ width:38, height:38, fontSize:14 }}>
                {initials(getPatientLabel(activeConv || {}))}
              </div>
              <div>
                <div className="dr-chat-header-name">{getPatientLabel(activeConv || {})}</div>
                <div className="dr-chat-header-sub">Patient</div>
              </div>
            </div>

            <div className="dr-messages">
              {loadingMsgs && <p style={{ textAlign:"center", color:"#bbb", fontSize:13 }}>Loading messages…</p>}
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg._id} className={`dr-row ${isMine ? "dr-row--mine" : ""}`}>
                    {!isMine && (
                      <div className="dr-mini-av">Pt</div>
                    )}
                    <div className={`dr-bubble ${isMine ? "dr-bubble--mine" : "dr-bubble--theirs"}`}>
                      {msg.fileType === "image" && (
                        <img
                          src={`${API_URL}${msg.fileUrl}`}
                          alt="attachment"
                          className="dr-img"
                          onClick={() => window.open(`${API_URL}${msg.fileUrl}`, "_blank")}
                        />
                      )}
                      {msg.fileType === "file" && (
                        <a
                          href={`${API_URL}${msg.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="dr-file-link"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}
                      {msg.text && <span>{msg.text}</span>}
                      <div className="dr-bubble-time">{formatTime(msg.createdAt)}</div>
                      {isMine && (
                        <div className="dr-read">
                          {msg.readBy?.length > 1 ? "✓✓ Seen" : "✓ Sent"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="dr-row">
                  <div className="dr-mini-av">Pt</div>
                  <div className="dr-bubble dr-bubble--theirs">
                    <div className="dr-typing"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="dr-input-bar">
              <input type="file" ref={fileInputRef} style={{ display:"none" }} onChange={handleFile} />
              <button className="dr-file-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">📎</button>
              <div className="dr-input-wrap">
                <input
                  className="dr-input"
                  placeholder="Write to patient…"
                  value={text}
                  onChange={(e) => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
              </div>
              <button className="dr-send-btn" onClick={handleSend} disabled={!text.trim()}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default DoctorMessages;