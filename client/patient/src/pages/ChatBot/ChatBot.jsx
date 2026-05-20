import { useState, useEffect, useRef } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ─── Inline global styles injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red-vivid:   #e63946;
    --red-deep:    #c1121f;
    --red-soft:    #fff0f0;
    --red-border:  #fcd5d5;
    --bg:          #f8f4f4;
    --surface:     #ffffff;
    --text-main:   #1a1a1a;
    --text-muted:  #8a8a8a;
    --green-bg:    #e6faf0;
    --green-text:  #15803d;
    --shadow-sm:   0 1px 3px rgba(0,0,0,.08);
    --shadow-md:   0 4px 16px rgba(0,0,0,.10);
    --radius-lg:   20px;
    --radius-pill: 999px;
    --font-body:   'DM Sans', sans-serif;
    --font-display:'Playfair Display', serif;
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    font-family: var(--font-body);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Chat shell ── */
  .hs-shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    width: calc(100% - 280px);
    margin-left: 280px;
    padding: 0;
    background: var(--bg);
  }

  /* Mobile: sidebar overlays as drawer, no offset needed */
  @media screen and (max-width: 1068px) {
    .hs-shell {
      width: 100%;
      margin-left: 0;
    }
  }

  /* ── Header ── */
  .hs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--red-border);
    flex-shrink: 0;
  }

  .hs-header-left { display: flex; align-items: center; gap: 12px; }

  .hs-logo {
    width: 42px; height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--red-vivid), var(--red-deep));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(230,57,70,.35);
  }

  .hs-title {
    font-family: var(--font-display);
    font-size: clamp(16px, 3vw, 20px);
    color: var(--text-main);
    line-height: 1.1;
  }

  .hs-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .hs-badge {
    display: flex; align-items: center; gap: 6px;
    background: var(--green-bg);
    color: var(--green-text);
    font-size: 11px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }

  .hs-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--green-text);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .5; transform: scale(.8); }
  }

  /* ── Chat scroll area ── */
  .hs-chat {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;            /* crucial flex shrink fix */
    scroll-behavior: smooth;
  }

  /* custom scrollbar */
  .hs-chat::-webkit-scrollbar { width: 4px; }
  .hs-chat::-webkit-scrollbar-thumb { background: var(--red-border); border-radius: 4px; }

  /* ── Message bubbles ── */
  .hs-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: slideUp .22s ease both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hs-row--user { flex-direction: row-reverse; }

  .hs-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    background: var(--red-soft);
  }

  .hs-row--user .hs-avatar {
    background: linear-gradient(135deg, var(--red-vivid), var(--red-deep));
  }

  .hs-bubble {
    max-width: min(75%, 480px);
    padding: 11px 15px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.55;
    word-break: break-word;
    box-shadow: var(--shadow-sm);
  }

  .hs-bubble--bot {
    background: var(--red-soft);
    border: 1px solid var(--red-border);
    color: var(--text-main);
    border-bottom-left-radius: 4px;
  }

  .hs-bubble--user {
    background: linear-gradient(135deg, var(--red-vivid), var(--red-deep));
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .hs-time {
    font-size: 10px;
    opacity: .55;
    margin-top: 4px;
    text-align: right;
  }

  .hs-bubble--bot .hs-time { text-align: left; }

  /* typing dots */
  .hs-dots { display: flex; gap: 4px; align-items: center; height: 18px; }
  .hs-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--red-vivid);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .hs-dots span:nth-child(2) { animation-delay: .2s; }
  .hs-dots span:nth-child(3) { animation-delay: .4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: .5; }
    40%            { transform: translateY(-5px); opacity: 1; }
  }

  /* ── Input footer ── */
  .hs-footer {
    flex-shrink: 0;
    background: var(--surface);
    border-top: 1px solid var(--red-border);
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hs-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1.5px solid var(--red-border);
    border-radius: var(--radius-pill);
    padding: 6px 8px 6px 16px;
    transition: border-color .18s;
  }

  .hs-input-row:focus-within { border-color: var(--red-vivid); }

  .hs-input-row input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-main);
    min-width: 0;            /* prevent overflow */
  }

  .hs-input-row input::placeholder { color: var(--text-muted); }

  .hs-send {
    flex-shrink: 0;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, var(--red-vivid), var(--red-deep));
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: transform .15s, opacity .15s;
    box-shadow: 0 2px 8px rgba(230,57,70,.35);
  }

  .hs-send:disabled { opacity: .45; cursor: not-allowed; }
  .hs-send:not(:disabled):hover { transform: scale(1.08); }
  .hs-send:not(:disabled):active { transform: scale(.95); }

  .hs-warning {
    text-align: center;
    font-size: 10.5px;
    color: var(--text-muted);
    padding-bottom: 2px;
  }

  /* ── Bottom safe area for iOS ── */
  .hs-bottom-safe { height: env(safe-area-inset-bottom, 0px); background: var(--surface); }

  /* ── Chat area fill ── */
  .hs-chat {
    background: var(--bg);
  }

  /* ── Responsive: comfortable padding on wide screens ── */
  @media (min-width: 1280px) {
    .hs-chat   { padding: 28px 40px; }
    .hs-footer { padding: 14px 40px; }
    .hs-header { padding: 14px 40px; }
  }
`;

function injectStyles() {
  if (document.getElementById("hs-styles")) return;
  const tag = document.createElement("style");
  tag.id = "hs-styles";
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
}

/* ─── Component ─── */
const ChatBot = () => {
  injectStyles();

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm your Heart-Shield AI assistant. How can I help you today?",
      time: now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText, time: now() },
      { role: "bot", text: null, loading: true },
    ]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => !m.loading),
        { role: "bot", text: data.reply, time: now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => !m.loading),
        { role: "bot", text: "Server error. Please try again.", time: now() },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="hs-shell">
      {/* HEADER */}
      <header className="hs-header">
        <div className="hs-header-left">
          <div className="hs-logo">❤️</div>
          <div>
            <div className="hs-title">Heart-Shield AI</div>
            <div className="hs-subtitle">Your AI health companion</div>
          </div>
        </div>
        <div className="hs-badge">
          <span className="hs-badge-dot" />
          Online
        </div>
      </header>

      {/* CHAT */}
      <div className="hs-chat">
        {messages.map((msg, i) => (
          <div key={i} className={`hs-row ${msg.role === "user" ? "hs-row--user" : ""}`}>
            <div className="hs-avatar">
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className={`hs-bubble ${msg.role === "bot" ? "hs-bubble--bot" : "hs-bubble--user"}`}>
              {msg.loading ? (
                <div className="hs-dots">
                  <span /><span /><span />
                </div>
              ) : (
                <>
                  {msg.text}
                  {msg.time && <div className="hs-time">{msg.time}</div>}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* FOOTER */}
      <footer className="hs-footer">
        <div className="hs-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about heart health…"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            aria-label="Chat input"
          />
          <button
            className="hs-send"
            onClick={sendMessage}
            disabled={loading}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
        <p className="hs-warning">⚠️ Educational only — always consult a doctor</p>
      </footer>

      {/* iOS safe area spacer */}
      <div className="hs-bottom-safe" />
    </div>
  );
};

export default ChatBot;