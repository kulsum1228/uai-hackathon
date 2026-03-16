// ============================================================
// EmergencyMode.jsx — Emergency instructions for rural patients
// Works fully offline — no network dependency
// ============================================================

import { useState, useEffect } from "react";

// ─── Cached emergency data (used when offline) ────────────
// This data is bundled with the app so it works without internet
const OFFLINE_EMERGENCY_DATA = {
  emergencyNumbers: [
    { label: "National Emergency", number: "112", icon: "🚨" },
    { label: "Ambulance", number: "108", icon: "🚑" },
    { label: "Police", number: "100", icon: "👮" },
    { label: "Fire Brigade", number: "101", icon: "🔥" },
    { label: "Women Helpline", number: "1091", icon: "👩" },
    { label: "Poison Control", number: "1800-11-6117", icon: "☠️" },
  ],
  firstAidTips: [
    {
      id: 1,
      title: "Heart Attack",
      icon: "❤️",
      urgency: "critical",
      steps: [
        "Call 108 immediately.",
        "Ask the person to sit or lie down — do not let them walk.",
        "Loosen tight clothing around chest and neck.",
        "If person is unconscious and not breathing, begin CPR.",
        "Give aspirin (325mg) if available and person is not allergic.",
        "Stay with them until help arrives.",
      ],
    },
    {
      id: 2,
      title: "Choking",
      icon: "🫁",
      urgency: "critical",
      steps: [
        "Ask: 'Are you choking?' If they cannot speak, act immediately.",
        "Stand behind the person and wrap arms around their waist.",
        "Make a fist and place thumb-side against abdomen (just above navel).",
        "Grasp fist with other hand and give sharp upward thrusts.",
        "Repeat until object is expelled or person loses consciousness.",
        "If unconscious, call 108 and begin CPR.",
      ],
    },
    {
      id: 3,
      title: "Severe Bleeding",
      icon: "🩸",
      urgency: "critical",
      steps: [
        "Apply firm, direct pressure on the wound with a clean cloth.",
        "Do NOT remove the cloth — add more cloth on top if it soaks through.",
        "Raise the injured body part above the level of the heart if possible.",
        "Keep pressing for at least 10–15 minutes without lifting.",
        "Call 108 for large wounds or wounds that won't stop bleeding.",
      ],
    },
    {
      id: 4,
      title: "Burns",
      icon: "🔥",
      urgency: "high",
      steps: [
        "Move person away from the heat source immediately.",
        "Cool the burn under cool (not cold) running water for 20 minutes.",
        "Do NOT use ice, butter, or toothpaste on burns.",
        "Cover loosely with a clean, non-fluffy cloth or cling film.",
        "Do NOT pop blisters.",
        "Seek medical care for burns larger than the person's palm.",
      ],
    },
    {
      id: 5,
      title: "Unconscious Person",
      icon: "😵",
      urgency: "critical",
      steps: [
        "Call 108 immediately.",
        "Check for breathing — look for chest rise, listen, feel for breath.",
        "If breathing: place in recovery position (on their side).",
        "If not breathing: begin CPR — 30 chest compressions, 2 rescue breaths.",
        "Do not give anything by mouth to an unconscious person.",
        "Stay until emergency services arrive.",
      ],
    },
    {
      id: 6,
      title: "Snake Bite",
      icon: "🐍",
      urgency: "critical",
      steps: [
        "Keep the person calm and still — movement speeds venom spread.",
        "Immobilise the bitten limb at or below heart level.",
        "Remove rings, watches, or tight clothing near the bite.",
        "Do NOT cut the bite, suck the venom, or apply a tourniquet.",
        "Note the snake's appearance if safe to do so.",
        "Rush to the nearest hospital immediately — anti-venom is essential.",
      ],
    },
    {
      id: 7,
      title: "Fever (High)",
      icon: "🌡️",
      urgency: "medium",
      steps: [
        "Give paracetamol (as per age/weight dosage).",
        "Apply a cool, damp cloth to forehead, neck, and armpits.",
        "Ensure the person drinks plenty of fluids.",
        "Do NOT use cold water or ice baths.",
        "Seek medical care if fever exceeds 103°F / 39.5°C.",
        "Seek immediate care for fever in infants under 3 months.",
      ],
    },
    {
      id: 8,
      title: "Fracture / Broken Bone",
      icon: "🦴",
      urgency: "high",
      steps: [
        "Do NOT try to straighten the bone.",
        "Immobilise the injured area using a makeshift splint (sticks, rolled newspaper).",
        "Pad the splint with cloth for comfort.",
        "If skin is broken, cover with a clean cloth.",
        "Apply ice wrapped in cloth to reduce swelling.",
        "Transport carefully to the nearest hospital.",
      ],
    },
  ],
};

const CACHE_KEY = "telehealth_emergency_data";

// ─── Styles ────────────────────────────────────────────────
const urgencyColor = { critical: "#c0392b", high: "#e67e22", medium: "#f39c12" };
const urgencyBg = { critical: "#fdf0ef", high: "#fef5ec", medium: "#fefce8" };

const s = {
  page: {
    fontFamily: "'Georgia', serif",
    minHeight: "100vh",
    background: "#1a0a0a",
    color: "#fff",
    padding: "0",
  },
  redHeader: {
    background: "linear-gradient(135deg, #c0392b 0%, #922b21 100%)",
    padding: "20px 16px",
    textAlign: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 2px 12px rgba(192,57,43,0.5)",
  },
  sos: {
    fontSize: "36px",
    fontWeight: "bold",
    letterSpacing: "4px",
    margin: 0,
    textShadow: "0 0 20px rgba(255,100,100,0.6)",
  },
  headerSub: {
    fontSize: "12px",
    opacity: 0.85,
    marginTop: "4px",
  },
  offlinePill: {
    display: "inline-block",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "12px",
    padding: "2px 10px",
    fontSize: "11px",
    marginTop: "6px",
  },
  content: {
    padding: "16px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#ff8a80",
    marginBottom: "10px",
    marginTop: "20px",
  },
  numberGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "8px",
  },
  numberCard: {
    background: "#2d0a0a",
    border: "1px solid #5c1a1a",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    textDecoration: "none",
  },
  numberIcon: { fontSize: "20px" },
  numberLabel: { fontSize: "11px", color: "#ffaaaa", marginBottom: "2px" },
  numberDigits: { fontSize: "16px", fontWeight: "bold", color: "#fff", letterSpacing: "1px" },
  tipCard: (urgency, expanded) => ({
    background: expanded ? urgencyBg[urgency] : "#fff",
    border: `1px solid ${expanded ? urgencyColor[urgency] : "#e0e0e0"}`,
    borderRadius: "8px",
    marginBottom: "8px",
    overflow: "hidden",
    transition: "all 0.2s",
  }),
  tipHeader: (urgency) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    cursor: "pointer",
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
  }),
  tipLeft: { display: "flex", alignItems: "center", gap: "8px" },
  tipIcon: { fontSize: "20px" },
  tipTitle: { fontSize: "14px", fontWeight: "bold", color: "#1a0a0a" },
  urgencyTag: (urgency) => ({
    fontSize: "9px",
    background: urgencyColor[urgency],
    color: "#fff",
    padding: "1px 6px",
    borderRadius: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  chevron: (expanded) => ({
    fontSize: "12px",
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.2s",
    color: "#666",
  }),
  stepsList: {
    padding: "0 12px 12px 12px",
    margin: 0,
    listStyle: "none",
  },
  stepItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    padding: "5px 0",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    fontSize: "13px",
    color: "#2c1010",
    lineHeight: "1.5",
  },
  stepNum: (urgency) => ({
    background: urgencyColor[urgency],
    color: "#fff",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    minWidth: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    marginTop: "2px",
  }),
  disclaimer: {
    background: "#2d0a0a",
    border: "1px solid #5c1a1a",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "11px",
    color: "#ffaaaa",
    textAlign: "center",
    marginTop: "20px",
    lineHeight: "1.6",
  },
};

// ============================================================
// Component
// ============================================================
const EmergencyMode = () => {
  const [data, setData] = useState(OFFLINE_EMERGENCY_DATA);
  const [expandedTip, setExpandedTip] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ── Track connectivity ────────────────────────────────────
  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  // ── Fetch live data if online, else use bundle/cache ──────
  useEffect(() => {
    const fetchEmergencyData = async () => {
      if (!isOnline) {
        // Try cached data first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try { setData(JSON.parse(cached)); } catch { /* use bundled */ }
        }
        return;
      }

      try {
        const token = localStorage.getItem("telehealth_token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/emergency/info`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const json = await res.json();
          setData(json.data || OFFLINE_EMERGENCY_DATA);
          // Cache for offline use
          localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
        }
      } catch {
        // Network error — use bundled data (already set as default)
      }
    };

    fetchEmergencyData();
  }, [isOnline]);

  const toggleTip = (id) => setExpandedTip((prev) => (prev === id ? null : id));

  return (
    <div style={s.page}>
      {/* Sticky red SOS header */}
      <div style={s.redHeader}>
        <p style={s.sos}>🆘 SOS</p>
        <p style={s.headerSub}>Emergency Mode — First Aid & Helplines</p>
        {!isOnline && (
          <span style={s.offlinePill}>📵 Offline — using saved data</span>
        )}
      </div>

      <div style={s.content}>
        {/* Emergency numbers */}
        <p style={s.sectionTitle}>📞 Emergency Helplines</p>
        <div style={s.numberGrid}>
          {data.emergencyNumbers.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              style={s.numberCard}
            >
              <span style={s.numberIcon}>{n.icon}</span>
              <div>
                <p style={s.numberLabel}>{n.label}</p>
                <p style={s.numberDigits}>{n.number}</p>
              </div>
            </a>
          ))}
        </div>

        {/* First aid accordion */}
        <p style={s.sectionTitle}>🩺 First Aid Instructions</p>
        {data.firstAidTips.map((tip) => {
          const expanded = expandedTip === tip.id;
          return (
            <div key={tip.id} style={s.tipCard(tip.urgency, expanded)}>
              <button
                style={s.tipHeader(tip.urgency)}
                onClick={() => toggleTip(tip.id)}
              >
                <div style={s.tipLeft}>
                  <span style={s.tipIcon}>{tip.icon}</span>
                  <div>
                    <p style={s.tipTitle}>{tip.title}</p>
                    <span style={s.urgencyTag(tip.urgency)}>{tip.urgency}</span>
                  </div>
                </div>
                <span style={s.chevron(expanded)}>▼</span>
              </button>

              {expanded && (
                <ol style={s.stepsList}>
                  {tip.steps.map((step, i) => (
                    <li key={i} style={s.stepItem}>
                      <span style={s.stepNum(tip.urgency)}>{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}

        {/* Disclaimer */}
        <div style={s.disclaimer}>
          ⚠️ These are general first aid guidelines only. Always call emergency
          services (108) for serious conditions. This information does not replace
          professional medical advice.
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;