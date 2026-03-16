// ============================================================
// TextConsultation.jsx — Low-bandwidth text consultation chat
// Designed for rural patients on slow 2G/3G connections
// ============================================================

import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────
const CACHE_KEY_PREFIX = "telehealth_chat_";
const MAX_CACHED_MESSAGES = 50; // Limit localStorage size

// ─── Inline styles (no external CSS import = faster load) ─
const styles = {
  wrapper: {
    fontFamily: "'Georgia', serif",
    minHeight: "100vh",
    background: "#f0f4f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    background: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #c8d8c8",
    display: "flex",
    flexDirection: "column",
    height: "90vh",
    boxShadow: "0 2px 8px rgba(0,60,0,0.08)",
  },
  header: {
    background: "#2d6a2d",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { margin: 0, fontSize: "15px", fontWeight: "bold" },
  headerSub: { fontSize: "11px", opacity: 0.85, marginTop: "2px" },
  statusBadge: {
    fontSize: "11px",
    background: "rgba(255,255,255,0.2)",
    padding: "3px 8px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  statusDot: (online) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: online ? "#7fff7f" : "#ff9f9f",
    flexShrink: 0,
  }),
  offlineBanner: {
    background: "#fff3cd",
    border: "1px solid #ffc107",
    padding: "8px 12px",
    fontSize: "12px",
    color: "#856404",
    textAlign: "center",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    background: "#f8faf8",
  },
  emptyState: {
    textAlign: "center",
    color: "#8a9e8a",
    fontSize: "13px",
    marginTop: "40px",
    lineHeight: "1.6",
  },
  // Message bubble — patient (right) vs doctor (left)
  bubble: (isOwn) => ({
    maxWidth: "78%",
    alignSelf: isOwn ? "flex-end" : "flex-start",
    background: isOwn ? "#2d6a2d" : "#ffffff",
    color: isOwn ? "#ffffff" : "#1a2e1a",
    padding: "8px 12px",
    borderRadius: isOwn ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
    border: isOwn ? "none" : "1px solid #d4e4d4",
    fontSize: "13px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  }),
  bubbleMeta: (isOwn) => ({
    fontSize: "10px",
    color: isOwn ? "rgba(255,255,255,0.7)" : "#8a9e8a",
    marginTop: "3px",
    textAlign: isOwn ? "right" : "left",
  }),
  pendingBadge: {
    fontSize: "10px",
    color: "#999",
    fontStyle: "italic",
    alignSelf: "flex-end",
    marginTop: "-4px",
  },
  inputArea: {
    padding: "10px 12px",
    borderTop: "1px solid #d4e4d4",
    display: "flex",
    gap: "8px",
    background: "#fff",
    borderRadius: "0 0 8px 8px",
  },
  textarea: {
    flex: 1,
    border: "1px solid #c8d8c8",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "13px",
    fontFamily: "'Georgia', serif",
    resize: "none",
    outline: "none",
    lineHeight: "1.4",
    background: "#f8faf8",
  },
  sendBtn: (disabled) => ({
    background: disabled ? "#c8d8c8" : "#2d6a2d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0 16px",
    fontSize: "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Georgia', serif",
    minWidth: "64px",
    transition: "background 0.2s",
  }),
  dataInfo: {
    textAlign: "center",
    fontSize: "10px",
    color: "#8a9e8a",
    padding: "4px",
    borderTop: "1px solid #e8f0e8",
  },
};

// ─── Helper: format timestamp ─────────────────────────────
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ─── Helper: calculate approximate data usage ─────────────
const estimateDataKB = (messages) => {
  const json = JSON.stringify(messages);
  return (new Blob([json]).size / 1024).toFixed(1);
};

// ============================================================
// Component
// ============================================================
const TextConsultation = ({ consultationId, currentUserId, token }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [consultationStatus, setConsultationStatus] = useState("accepted");
  const bottomRef = useRef(null);
  const cacheKey = `${CACHE_KEY_PREFIX}${consultationId}`;

  // ── Online / offline detection ───────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushPendingMessages(); // Send queued messages when reconnected
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pendingMessages]);

  // ── Load messages from cache or API on mount ──────────────
  useEffect(() => {
    loadMessages();
  }, [consultationId]);

  // ── Auto-scroll to latest message ─────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Poll for new messages every 10 seconds (low-bandwidth friendly) ──
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [isOnline, consultationId]);

  // ─── Load: try API first, fall back to cache ─────────────
  const loadMessages = async () => {
    // Always show cached messages immediately for fast perceived load
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch {
        // Ignore malformed cache
      }
    }

    if (isOnline) await fetchMessages();
  };

  // ─── Fetch messages from the backend ─────────────────────
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/consultations/${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return;
      const data = await res.json();
      const fetched = data.consultation?.messages || [];

      setMessages(fetched);
      setConsultationStatus(data.consultation?.status);

      // Cache the latest messages — keep last N to limit localStorage size
      const toCache = fetched.slice(-MAX_CACHED_MESSAGES);
      localStorage.setItem(cacheKey, JSON.stringify(toCache));
    } catch {
      // Network error — already showing cached messages
    }
  };

  // ─── Send a message ───────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    const optimisticMsg = {
      _id: `temp_${Date.now()}`,
      senderId: currentUserId,
      messageText: text,
      timestamp: new Date().toISOString(),
      pending: true,
    };

    // Optimistic UI — show message immediately before server confirms
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    if (!isOnline) {
      // Queue for when connectivity returns
      setPendingMessages((prev) => [...prev, text]);
      return;
    }

    await sendToServer(text, optimisticMsg._id);
  };

  // ─── POST message to backend ──────────────────────────────
  const sendToServer = async (text, tempId) => {
    setIsSending(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/consultations/message/${consultationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Minimal payload — only send what's needed
          body: JSON.stringify({ messageText: text }),
        }
      );

      if (res.ok) {
        // Replace optimistic message with confirmed one
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...m, pending: false } : m))
        );
        // Refresh to get server timestamp
        await fetchMessages();
      }
    } catch {
      // Mark as failed but keep in UI
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, failed: true, pending: false } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // ─── Flush queued messages on reconnect ───────────────────
  const flushPendingMessages = async () => {
    if (pendingMessages.length === 0) return;
    for (const text of pendingMessages) {
      await sendToServer(text, null);
    }
    setPendingMessages([]);
  };

  // ─── Handle Enter key (Shift+Enter for newline) ───────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = consultationStatus === "accepted";

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerTitle}>💬 Text Consultation</p>
            <p style={styles.headerSub}>Low-data mode — works on slow networks</p>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot(isOnline)} />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div style={styles.offlineBanner}>
            ⚠️ You are offline. Messages will be sent when connection is restored.
            {pendingMessages.length > 0 && (
              <span> ({pendingMessages.length} pending)</span>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No messages yet.</p>
              <p>Type your message below to start the consultation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn =
                msg.senderId === currentUserId ||
                msg.senderId?._id === currentUserId;
              return (
                <div key={msg._id || idx}>
                  <div style={styles.bubble(isOwn)}>{msg.messageText}</div>
                  <div style={styles.bubbleMeta(isOwn)}>
                    {msg.pending ? "Sending..." : msg.failed ? "Failed ✗" : formatTime(msg.timestamp)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Data usage info — helps rural users track consumption */}
        <div style={styles.dataInfo}>
          ~{estimateDataKB(messages)} KB used this session
        </div>

        {/* Input area */}
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            rows={2}
            placeholder={
              canSend
                ? "Type your message… (Enter to send)"
                : "Consultation is not active."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canSend || isSending}
          />
          <button
            style={styles.sendBtn(!canSend || isSending || !inputText.trim())}
            onClick={handleSend}
            disabled={!canSend || isSending || !inputText.trim()}
          >
            {isSending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextConsultation;