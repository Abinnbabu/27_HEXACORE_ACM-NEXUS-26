import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../App";

/* ─── Theme (mirrors Home) ───────────────── */
const THEMES = {
    blue: {
        bg: "#F0F6FF", surface: "#FFFFFF", card: "#EBF3FF",
        primary: "#2255A4", accent: "#1A3F7A", muted: "#6B8BBF",
        text: "#0F2040", subtle: "#D8E8FF",
        gradient: "linear-gradient(160deg, #F7FAFF 0%, #E8F0FC 50%, #F0F6FF 100%)",
        navBg: "#2255A4", navText: "#FFFFFF",
    },
};

/* ─── Alert severity config ───────────────── */
const SEVERITY = {
    critical: {
        label: "Critical",
        color: "#C0392B",
        bg: "#FDF0EF",
        border: "#F5C6C2",
        dot: "#E74C3C",
        icon: "🔴",
    },
    warning: {
        label: "Warning",
        color: "#B7590A",
        bg: "#FEF6ED",
        border: "#FAD7A8",
        dot: "#E67E22",
        icon: "🟠",
    },
    info: {
        label: "Info",
        color: "#1A5276",
        bg: "#EBF5FB",
        border: "#AED6F1",
        dot: "#2980B9",
        icon: "🔵",
    },
};

/* ─── Global CSS ───────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }

  .nav-btn { transition: background .2s ease; cursor: pointer; }
  .nav-btn:hover { background: rgba(255,255,255,0.22); }

  .alert-row {
    transition: transform .2s ease, box-shadow .2s ease;
    cursor: default;
  }
  .alert-row:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 24px rgba(0,0,0,.08) !important;
  }

  .pulse-dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    animation: pulse 1.8s infinite;
    flex-shrink: 0;
    margin-top: 5px;
  }
  @keyframes pulse {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.45; transform: scale(1.35); }
    100% { opacity: 1; transform: scale(1); }
  }

  .fade-in {
    animation: fadeSlideIn .35s ease both;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .filter-btn {
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all .18s ease;
    border: 1.5px solid transparent;
  }
  .filter-btn:hover { opacity: 0.8; }
`;

/* ─── Mock data (replace with API call) ───────────────── */
const MOCK_ALERTS = [
    {
        id: 1,
        severity: "critical",
        title: "Hazardous Air Quality Detected",
        message: "PM2.5 levels have exceeded 300 µg/m³ in your area. Avoid outdoor activities. Wear N95 masks if going out.",
        location: "Thiruvananthapuram, Kerala",
        timestamp: "2025-03-27T08:14:00",
        isNew: true,
    },
    {
        id: 2,
        severity: "warning",
        title: "Industrial Discharge Alert",
        message: "Elevated effluent discharge detected near Karamana River. Residents advised not to use river water.",
        location: "Karamana, TVM",
        timestamp: "2025-03-27T06:45:00",
        isNew: true,
    },
    {
        id: 3,
        severity: "info",
        title: "Scheduled Waste Audit",
        message: "CPCB has scheduled a waste management audit for Technopark Industrial Zone on 28 March.",
        location: "Technopark, TVM",
        timestamp: "2025-03-26T15:30:00",
        isNew: false,
    },
    {
        id: 4,
        severity: "warning",
        title: "Noise Pollution Spike",
        message: "Noise levels above 75 dB recorded near Kesavadasapuram junction between 10 PM–1 AM.",
        location: "Kesavadasapuram, TVM",
        timestamp: "2025-03-26T10:00:00",
        isNew: false,
    },
    {
        id: 5,
        severity: "info",
        title: "Green Cover Update",
        message: "Forest Survey of India reports 0.4% increase in green cover in Thiruvananthapuram district this quarter.",
        location: "District-wide",
        timestamp: "2025-03-25T09:00:00",
        isNew: false,
    },
];

/* ─── Helpers ───────────────── */
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Navbar ───────────────── */
function Navbar({ T }) {
    const navigate = useNavigate();
    const navBtn = {
        display: "flex", alignItems: "center", gap: 7,
        background: "rgba(255,255,255,0.13)",
        border: "1.5px solid rgba(255,255,255,0.28)",
        borderRadius: 10, padding: "8px 18px",
        color: T.navText, fontWeight: 500, fontSize: "0.84rem",
    };
    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 50,
            background: T.navBg, padding: "13px 36px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                    className="nav-btn"
                    onClick={() => navigate("/home")}
                    style={{
                        background: "rgba(255,255,255,0.13)",
                        border: "1.5px solid rgba(255,255,255,0.28)",
                        borderRadius: 8, padding: "6px 12px",
                        color: T.navText, cursor: "pointer", fontSize: "1rem",
                    }}
                >
                    ←
                </button>
                <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.3rem", color: T.navText,
                }}>
                    Climate Ai
                </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <button style={navBtn} className="nav-btn" onClick={() => navigate("/profile")}>Profile</button>
                <button style={navBtn} className="nav-btn" onClick={() => navigate("/")}>Logout</button>
            </div>
        </nav>
    );
}

/* ─── Single Alert Row ───────────────── */
function AlertRow({ alert, index }) {
    const s = SEVERITY[alert.severity];
    return (
        <div
            className="alert-row fade-in"
            style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 16,
                padding: "18px 22px",
                display: "flex",
                gap: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                animationDelay: `${index * 0.07}s`,
            }}
        >
            {/* Pulse dot */}
            <div style={{ paddingTop: 2 }}>
                <span
                    className="pulse-dot"
                    style={{ background: s.dot, display: alert.isNew ? "inline-block" : "none" }}
                />
                {!alert.isNew && (
                    <span style={{
                        display: "inline-block", width: 9, height: 9,
                        borderRadius: "50%", background: s.dot, opacity: 0.35, marginTop: 5,
                    }} />
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                    marginBottom: 6,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h3 style={{
                            fontFamily: "'DM Serif Display', serif",
                            color: s.color, fontSize: "1.05rem",
                        }}>
                            {alert.title}
                        </h3>
                        <span className="chip" style={{ background: s.border, color: s.color }}>
                            {s.icon} {s.label}
                        </span>
                        {alert.isNew && (
                            <span className="chip" style={{
                                background: "#2255A4", color: "#fff",
                            }}>
                                New
                            </span>
                        )}
                    </div>
                    <span style={{ color: "#999", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {formatTime(alert.timestamp)}
                    </span>
                </div>

                <p style={{ color: "#444", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 8 }}>
                    {alert.message}
                </p>

                <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    color: "#888", fontSize: "0.78rem",
                }}>
                    <span>📍</span>
                    <span>{alert.location}</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Alert Page ───────────────── */
export default function AlertPage() {
    const { themeKey } = useContext(ThemeContext);
    const T = THEMES[themeKey] || THEMES.blue;

    // Replace MOCK_ALERTS with your API fetch
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        // TODO: Replace with real API call
        // e.g. fetch("/api/alerts").then(r => r.json()).then(data => setAlerts(data));
        setTimeout(() => {
            setAlerts(MOCK_ALERTS);
            setLoading(false);
        }, 600);
    }, []);

    const filtered = filter === "all"
        ? alerts
        : alerts.filter(a => a.severity === filter);

    const counts = {
        all: alerts.length,
        critical: alerts.filter(a => a.severity === "critical").length,
        warning: alerts.filter(a => a.severity === "warning").length,
        info: alerts.filter(a => a.severity === "info").length,
    };

    const newCount = alerts.filter(a => a.isNew).length;

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div style={{ minHeight: "100vh", background: T.gradient, color: T.text }}>
                <Navbar T={T} />

                <main style={{ padding: "50px 24px 80px" }}>
                    <div style={{ maxWidth: 780, margin: "0 auto" }}>

                        {/* Header */}
                        <div style={{ marginBottom: 36 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                                <h1 style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: "2.2rem",
                                    color: T.accent,
                                }}>
                                    Alert Centre
                                </h1>
                                {newCount > 0 && (
                                    <span style={{
                                        background: "#E74C3C", color: "#fff",
                                        borderRadius: 20, padding: "3px 11px",
                                        fontSize: "0.78rem", fontWeight: 600,
                                        marginTop: 4,
                                    }}>
                                        {newCount} new
                                    </span>
                                )}
                            </div>
                            <p style={{ color: T.muted, fontSize: "0.92rem" }}>
                                Recent environmental alerts issued for your registered locations.
                            </p>
                        </div>

                        {/* Filter chips */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
                            {["all", "critical", "warning", "info"].map(key => {
                                const active = filter === key;
                                const cfg = key === "all"
                                    ? { color: T.primary, bg: T.subtle }
                                    : { color: SEVERITY[key].color, bg: SEVERITY[key].border };
                                return (
                                    <button
                                        key={key}
                                        className="filter-btn"
                                        onClick={() => setFilter(key)}
                                        style={{
                                            background: active ? cfg.bg : "transparent",
                                            color: active ? cfg.color : T.muted,
                                            borderColor: active ? cfg.color : T.subtle,
                                        }}
                                    >
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                        <span style={{ marginLeft: 6, opacity: 0.7 }}>({counts[key]})</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Alert list */}
                        {loading ? (
                            <div style={{
                                textAlign: "center", padding: "60px 0",
                                color: T.muted, fontSize: "0.95rem",
                            }}>
                                <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                                Fetching alerts from server...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: "60px 0",
                                color: T.muted, fontSize: "0.95rem",
                            }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                                No {filter !== "all" ? filter : ""} alerts at the moment.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {filtered.map((alert, i) => (
                                    <AlertRow key={alert.id} alert={alert} index={i} />
                                ))}
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </>
    );
}