import { useState, useContext } from "react";
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

/* ─── Global CSS ───────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }

  .nav-btn { transition: background .2s ease; cursor: pointer; }
  .nav-btn:hover { background: rgba(255,255,255,0.22); }

  .survey-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
    background: #FFFFFF;
    color: #0F2040;
  }
  .survey-input:focus {
    border-color: #2255A4 !important;
    box-shadow: 0 0 0 3px rgba(34,85,164,0.12);
  }
  .survey-input::placeholder { color: #9BAED0; }

  .severity-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all .18s ease;
    border: 1.5px solid transparent;
  }

  .submit-btn {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: none;
    background: #2255A4;
    color: #fff;
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background .2s ease, transform .15s ease;
    letter-spacing: 0.02em;
  }
  .submit-btn:hover { background: #1A3F7A; transform: translateY(-2px); }
  .submit-btn:active { transform: translateY(0); }

  .fade-in {
    animation: fadeUp .4s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .success-card {
    animation: popIn .35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

const HAZARD_OPTIONS = [
    { value: "flood",      label: "🌊 Flood" },
    { value: "pollution",  label: "🏭 Pollution" },
    { value: "landslide",  label: "⛰️ Landslide" },
    { value: "wildfire",   label: "🔥 Wildfire" },
    { value: "toxic_waste",label: "☣️ Toxic Waste" },
    { value: "other",      label: "⚠️ Other" },
];

const SEVERITY_CONFIG = {
    Low:    { color: "#1A7A3F", bg: "#EAF7EE", border: "#A8DFB8", active_bg: "#C6EDD2" },
    Medium: { color: "#B7590A", bg: "#FEF6ED", border: "#FAD7A8", active_bg: "#FAD7A8" },
    High:   { color: "#C0392B", bg: "#FDF0EF", border: "#F5C6C2", active_bg: "#F5C6C2" },
};

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

/* ─── Field wrapper ───────────────── */
function Field({ label, children, delay = 0 }) {
    return (
        <div className="fade-in" style={{ animationDelay: `${delay}s` }}>
            <label style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#1A3F7A",
                marginBottom: 7,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

/* ─── Survey Page ───────────────── */
export default function Survey() {
    const { themeKey } = useContext(ThemeContext);
    const T = THEMES[themeKey] || THEMES.blue;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "", email: "", location: "",
        hazard: "", severity: "", description: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const inputStyle = {
        border: `1.5px solid ${T.subtle}`,
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.name || !form.location || !form.hazard || !form.severity) {
            alert("Please fill in all required fields.");
            return;
        }
        console.log(form); // TODO: send to backend
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <>
                <style>{GLOBAL_CSS}</style>
                <div style={{ minHeight: "100vh", background: T.gradient, display: "flex", flexDirection: "column" }}>
                    <Navbar T={T} />
                    <div style={{
                        flex: 1, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        padding: 24,
                    }}>
                        <div className="success-card" style={{
                            background: T.surface,
                            border: `1px solid ${T.subtle}`,
                            borderRadius: 24,
                            padding: "52px 44px",
                            textAlign: "center",
                            maxWidth: 420,
                            boxShadow: "0 8px 40px rgba(0,0,0,.08)",
                        }}>
                            <div style={{ fontSize: "3.5rem", marginBottom: 18 }}>✅</div>
                            <h2 style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "1.8rem", color: T.accent, marginBottom: 12,
                            }}>
                                Report Submitted
                            </h2>
                            <p style={{ color: T.muted, lineHeight: 1.7, marginBottom: 32 }}>
                                Thank you, <strong style={{ color: T.text }}>{form.name}</strong>. Your{" "}
                                <strong style={{ color: T.text }}>{form.hazard}</strong> report has been received
                                and will be reviewed by our team.
                            </p>
                            <button
                                className="submit-btn"
                                onClick={() => { setForm({ name:"",email:"",location:"",hazard:"",severity:"",description:"" }); setSubmitted(false); }}
                                style={{ marginBottom: 12 }}
                            >
                                Submit Another Report
                            </button>
                            <button
                                onClick={() => navigate("/home")}
                                style={{
                                    width: "100%", padding: "12px",
                                    borderRadius: 14, border: `1.5px solid ${T.subtle}`,
                                    background: "transparent", color: T.primary,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "0.92rem", cursor: "pointer",
                                }}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div style={{ minHeight: "100vh", background: T.gradient, color: T.text }}>
                <Navbar T={T} />

                <main style={{ padding: "50px 24px 80px" }}>
                    <div style={{ maxWidth: 600, margin: "0 auto" }}>

                        {/* Header */}
                        <div className="fade-in" style={{ marginBottom: 36 }}>
                            <h1 style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "2.2rem", color: T.accent, marginBottom: 8,
                            }}>
                                Report a Hazard
                            </h1>
                            <p style={{ color: T.muted, fontSize: "0.92rem" }}>
                                Help us keep your community safe. All reports are reviewed by our environmental team.
                            </p>
                        </div>

                        {/* Card */}
                        <div style={{
                            background: T.surface,
                            border: `1px solid ${T.subtle}`,
                            borderRadius: 22,
                            padding: "34px 30px",
                            boxShadow: "0 4px 24px rgba(0,0,0,.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 22,
                        }}>

                            {/* Row: Name + Email */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field label="Your Name *" delay={0.05}>
                                    <input
                                        className="survey-input"
                                        style={inputStyle}
                                        name="name"
                                        placeholder="e.g. Abin Thomas"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </Field>
                                <Field label="Email" delay={0.1}>
                                    <input
                                        className="survey-input"
                                        style={inputStyle}
                                        name="email"
                                        type="email"
                                        placeholder="you@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </Field>
                            </div>

                            {/* Location */}
                            <Field label="Location *" delay={0.15}>
                                <input
                                    className="survey-input"
                                    style={inputStyle}
                                    name="location"
                                    placeholder="e.g. Karamana, Thiruvananthapuram"
                                    value={form.location}
                                    onChange={handleChange}
                                />
                            </Field>

                            {/* Hazard type */}
                            <Field label="Hazard Type *" delay={0.2}>
                                <select
                                    className="survey-input"
                                    style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                                    name="hazard"
                                    value={form.hazard}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a hazard type</option>
                                    {HAZARD_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Severity — pill toggle */}
                            <Field label="Severity *" delay={0.25}>
                                <div style={{ display: "flex", gap: 10 }}>
                                    {Object.entries(SEVERITY_CONFIG).map(([level, cfg]) => {
                                        const active = form.severity === level;
                                        return (
                                            <button
                                                key={level}
                                                type="button"
                                                className="severity-btn"
                                                onClick={() => setForm({ ...form, severity: level })}
                                                style={{
                                                    background: active ? cfg.active_bg : cfg.bg,
                                                    color: cfg.color,
                                                    borderColor: active ? cfg.color : cfg.border,
                                                    fontWeight: active ? 700 : 500,
                                                    boxShadow: active ? `0 0 0 2px ${cfg.color}33` : "none",
                                                }}
                                            >
                                                {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Description */}
                            <Field label="Description" delay={0.3}>
                                <textarea
                                    className="survey-input"
                                    style={{ ...inputStyle, resize: "vertical", minHeight: 110, lineHeight: 1.6 }}
                                    name="description"
                                    placeholder="Describe what you observed — include any visible signs, smells, affected area size, etc."
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </Field>

                            {/* Submit */}
                            <div className="fade-in" style={{ animationDelay: "0.35s", marginTop: 4 }}>
                                <button className="submit-btn" onClick={handleSubmit}>
                                    Submit Report →
                                </button>
                                <p style={{
                                    textAlign: "center", color: T.muted,
                                    fontSize: "0.78rem", marginTop: 10,
                                }}>
                                    * Required fields
                                </p>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}