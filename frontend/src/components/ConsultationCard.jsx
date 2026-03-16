// ============================================================
// components/ConsultationCard.jsx
// Displays a single consultation request or active session
// ============================================================

const CSS = `
  .cc-card {
    background: #fff;
    border: 1px solid #d0dce8;
    border-radius: 12px;
    padding: 18px 20px;
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .cc-card:not(.cc-muted):hover {
    box-shadow: 0 4px 16px rgba(0,40,80,0.08);
    transform: translateY(-1px);
  }
  .cc-card.cc-muted { opacity: 0.65; }

  .cc-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px; margin-bottom: 12px;
  }
  .cc-left { display: flex; align-items: flex-start; gap: 12px; }
  .cc-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: linear-gradient(135deg, #1a5276, #2d7a9f);
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 600; flex-shrink: 0;
  }
  .cc-name { font-size: 15px; font-weight: 600; color: #0f2a4a; margin-bottom: 3px; }
  .cc-time { font-size: 11px; color: #8a9aaa; }

  /* Status & type badges */
  .cc-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .cc-badge {
    font-size: 11px; font-weight: 500; border-radius: 20px;
    padding: 3px 10px;
  }
  .cc-badge-pending  { background: #fef9c3; color: #a16207; }
  .cc-badge-accepted { background: #dcfce7; color: #15803d; }
  .cc-badge-completed { background: #e0e7ff; color: #3730a3; }
  .cc-badge-chat  { background: #e0f2fe; color: #0369a1; }
  .cc-badge-audio { background: #f0fdf4; color: #15803d; }
  .cc-badge-video { background: #fdf4ff; color: #7e22ce; }

  /* Symptoms */
  .cc-symptoms-label { font-size: 11px; color: #8a9aaa; margin-bottom: 4px; }
  .cc-symptoms {
    font-size: 13px; color: #2a3a4a; line-height: 1.5;
    background: #f4f7fa; border-radius: 7px; padding: 8px 12px;
    margin-bottom: 14px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }

  /* Actions */
  .cc-actions { display: flex; gap: 8px; }
  .cc-btn-accept {
    background: #1a5c8a; color: #fff; border: none; border-radius: 7px;
    padding: 8px 18px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.15s;
  }
  .cc-btn-accept:hover { background: #134a70; }
  .cc-btn-reject {
    background: #fff; color: #b91c1c; border: 1px solid #fca5a5;
    border-radius: 7px; padding: 8px 18px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.15s;
  }
  .cc-btn-reject:hover { background: #fff5f5; }
  .cc-btn-open {
    background: #e8f5ee; color: #1a5c39; border: 1px solid #b0d8bc;
    border-radius: 7px; padding: 8px 18px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .cc-btn-open:hover { background: #d0eed8; }
`;

const TYPE_ICONS  = { chat: "💬", audio: "📞", video: "🎥" };
const TYPE_LABELS = { chat: "Text Chat", audio: "Audio", video: "Video" };

const ConsultationCard = ({ consultation, onAccept, onReject, onOpen, showActions, muted }) => {
  const { _id, patientId, symptoms, consultationType, status, createdAt } = consultation;

  const patientName = patientId?.name || "Unknown Patient";
  const initials    = patientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const timeAgo     = createdAt
    ? new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  const statusBadge = {
    pending:   { cls: "cc-badge-pending",   label: "⏳ Pending" },
    accepted:  { cls: "cc-badge-accepted",  label: "✓ Active" },
    completed: { cls: "cc-badge-completed", label: "✅ Done" },
  }[status] || { cls: "cc-badge-pending", label: status };

  const typeCls = { chat: "cc-badge-chat", audio: "cc-badge-audio", video: "cc-badge-video" };

  return (
    <>
      <style>{CSS}</style>
      <div className={`cc-card${muted ? " cc-muted" : ""}`}>

        <div className="cc-top">
          <div className="cc-left">
            <div className="cc-avatar">{initials}</div>
            <div>
              <p className="cc-name">{patientName}</p>
              <p className="cc-time">{timeAgo}</p>
            </div>
          </div>
          <div className="cc-badges">
            <span className={`cc-badge ${statusBadge.cls}`}>{statusBadge.label}</span>
            <span className={`cc-badge ${typeCls[consultationType]}`}>
              {TYPE_ICONS[consultationType]} {TYPE_LABELS[consultationType]}
            </span>
          </div>
        </div>

        <p className="cc-symptoms-label">Symptoms reported</p>
        <div className="cc-symptoms">{symptoms || "No symptoms described."}</div>

        <div className="cc-actions">
          {showActions && (
            <>
              <button className="cc-btn-accept" onClick={onAccept}>Accept</button>
              <button className="cc-btn-reject" onClick={onReject}>Decline</button>
            </>
          )}
          {!showActions && status === "accepted" && onOpen && (
            <button className="cc-btn-open" onClick={onOpen}>Open Consultation →</button>
          )}
        </div>

      </div>
    </>
  );
};

export default ConsultationCard;