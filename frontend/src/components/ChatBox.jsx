// ============================================================
// components/ChatBox.jsx
// Real-time chat interface for text consultations
// Polls every 8 seconds + optimistic UI for instant feel
// ============================================================

import { useState, useEffect, useRef } from "react";
import { consultationAPI } from "../services/api";

const CSS = `
  .cb-wrapper {
    display: flex; flex-direction: column; height: 100%;
    font-family: 'DM Sans', sans-serif;
    background: #f4f7fa; border-radius: 12px;
    border: 1px solid #d0dce8; overflow: hidden;
  }

  /* Header */
  .cb-header {
    background: #fff; border-bottom: 1px solid #e0ecf8;
    padding: 12px 16px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
  }
  .cb-header-title { font-size: 13px; font-weight: 600; color: #0f2a4a; }
  .cb-header-sub { font-size: 11px; color: #6a7a8a; }
  .cb-online-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e; display: inline-block; margin-right: 5px;
  }

  /* Messages area */
  .cb-messages {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .cb-messages::-webkit-scrollbar { width: 4px; }
  .cb-messages::-webkit-scrollbar-thumb { background: #c0d0e0; border-radius: 2px; }

  /* Message bubble */
  .cb-bubble-wrap {
    display: flex; flex-direction: column;
  }
  .cb-bubble-wrap.mine { align-items: flex-end; }
  .cb-bubble-wrap.theirs { align-items: flex-start; }

  .cb-sender {
    font-size: 10px; color: #8a9aaa; margin-bottom: 3px; padding: 0 4px;
  }
  .cb-bubble {
    max-width: 75%; padding: 9px 13px; border-radius: 12px;
    font-size: 13px; line-height: 1.5; word-break: break-word;
  }
  .cb-bubble.mine {
    background: #1a5276; color: #fff;
    border-radius: 12px 12px 3px 12px;
  }
  .cb-bubble.theirs {
    background: #fff; color: #1a2a3a;
    border: 1px solid #d8e8f0;
    border-radius: 12px 12px 12px 3px;
  }
  .cb-bubble.pending { opacity: 0.65; }
  .cb-bubble.failed { background: #fca5a5; color: #7f1d1d; }
  .cb-time {
    font-size: 10px; color: #8a9aaa;
    margin-top: 3px; padding: 0 4px;
  }

  /* Empty state */
  .cb-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #8a9aaa; font-size: 13px; gap: 8px;
  }
  .cb-empty-icon { font-size: 28px; }

  /* Input area */
  .cb-input-area {
    background: #fff; border-top: 1px solid #e0ecf8;
    padding: 12px 14px; display: flex; gap: 8px;
    align-items: flex-end; flex-shrink: 0;
  }
  .cb-textarea {
    flex: 1; border: 1px solid #c0d8e8; border-radius: 8px;
    padding: 9px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a2a3a; background: #f4f7fa; outline: none;
    resize: none; max-height: 100px; min-height: 38px;
    transition: border-color 0.15s, box-shadow 0.15s;
    line-height: 1.4;
  }
  .cb-textarea:focus {
    border-color: #1a5276;
    box-shadow: 0 0 0 3px rgba(26,82,118,0.1);
    background: #fff;
  }
  .cb-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
  .cb-send-btn {
    background: #1a5276; color: #fff; border: none; border-radius: 8px;
    width: 40px; height: 40px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; flex-shrink: 0;
    font-size: 16px; transition: background 0.15s;
  }
  .cb-send-btn:hover:not(:disabled) { background: #134a70; }
  .cb-send-btn:disabled { background: #a0b8cc; cursor: not-allowed; }

  .cb-closed {
    background: #fef9c3; border-top: 1px solid #fde68a;
    padding: 10px 14px; text-align: center;
    font-size: 12px; color: #92400e; flex-shrink: 0;
  }
`;

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatBox = ({ consultationId, currentUserId, consultationStatus }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);
  const canChat                 = consultationStatus === "accepted";

  // ── Fetch messages ───────────────────────────────────────
  const fetchMessages = async () => {
    try {
      const res = await consultationAPI.getById(consultationId);
      setMessages(res.data.consultation?.messages || []);
    } catch { /* silent — keep showing cached */ }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 8 seconds for new messages (low-bandwidth friendly)
    const interval = canChat ? setInterval(fetchMessages, 8000) : null;
    return () => interval && clearInterval(interval);
  }, [consultationId, canChat]);

  // ── Auto-scroll to latest message ───────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ─────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !canChat) return;

    // Optimistic message shown instantly
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId, senderId: currentUserId,
      messageText: text, timestamp: new Date().toISOString(), pending: true,
    };
    setMessages((p) => [...p, optimistic]);
    setInput("");
    setSending(true);

    try {
      await consultationAPI.sendMessage(consultationId, { messageText: text });
      // Replace optimistic with confirmed — refetch for server timestamp
      await fetchMessages();
    } catch {
      setMessages((p) =>
        p.map((m) => m._id === tempId ? { ...m, failed: true, pending: false } : m)
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cb-wrapper">

        {/* Header */}
        <div className="cb-header">
          <div>
            <p className="cb-header-title">
              <span className="cb-online-dot" />
              Consultation Chat
            </p>
            <p className="cb-header-sub">{messages.length} messages</p>
          </div>
          <span style={{ fontSize: "11px", color: "#8a9aaa" }}>
            {canChat ? "Active" : "Closed"}
          </span>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {messages.length === 0 ? (
            <div className="cb-empty">
              <span className="cb-empty-icon">💬</span>
              <span>No messages yet — start the conversation</span>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.senderId === currentUserId
                || msg.senderId?._id === currentUserId;
              return (
                <div key={msg._id || idx} className={`cb-bubble-wrap ${isOwn ? "mine" : "theirs"}`}>
                  {!isOwn && (
                    <span className="cb-sender">
                      {msg.senderId?.name || "Patient"}
                    </span>
                  )}
                  <div className={`cb-bubble ${isOwn ? "mine" : "theirs"}${msg.pending ? " pending" : ""}${msg.failed ? " failed" : ""}`}>
                    {msg.messageText}
                  </div>
                  <span className="cb-time">
                    {msg.pending ? "Sending…" : msg.failed ? "Failed ✗" : formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input or closed notice */}
        {canChat ? (
          <div className="cb-input-area">
            <textarea
              className="cb-textarea"
              rows={1}
              placeholder="Type a message… (Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              className="cb-send-btn"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              {sending ? "…" : "➤"}
            </button>
          </div>
        ) : (
          <div className="cb-closed">
            This consultation is {consultationStatus} — chat is closed.
          </div>
        )}

      </div>
    </>
  );
};

export default ChatBox;