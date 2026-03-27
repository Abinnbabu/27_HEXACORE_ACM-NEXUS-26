import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../App";

/* ─── Theme (static, no switching) ───────────────── */
const THEMES = {
    blue: {
        bg: "#F0F6FF",surface: "#FFFFFF",card: "#EBF3FF",
        primary: "#2255A4",accent: "#1A3F7A",muted: "#6B8BBF",
        text: "#0F2040",subtle: "#D8E8FF",
        gradient: "linear-gradient(160deg, #F7FAFF 0%, #E8F0FC 50%, #F0F6FF 100%)",
        navBg: "#2255A4",navText: "#FFFFFF",
    },
};

/* ─── Global CSS (cleaned, no bubbles) ───────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }

  .feat-card { transition: all .25s ease; cursor: pointer; }
  .feat-card:hover { transform: translateY(-5px); }

  .nav-btn {
    transition: background .2s ease;
    cursor: pointer;
  }
  .nav-btn:hover {
    background: rgba(255,255,255,0.22);
  }
`;

/* ─── Navbar ───────────────── */
function Navbar({ T }) {
    const navigate = useNavigate();

    const navBtn = {
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: "rgba(255,255,255,0.13)",
        border: "1.5px solid rgba(255,255,255,0.28)",
        borderRadius: 10,
        padding: "8px 18px",
        color: T.navText,
        fontWeight: 500,
        fontSize: "0.84rem",
    };

    return (
        <nav style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: T.navBg,
            padding: "13px 36px",
            display: "flex",
            justifyContent: "space-between",
        }}>
            <span style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.3rem",
                color: T.navText,
            }}>
                Climate Ai
            </span>

            <div style={{ display: "flex",gap: 10 }}>
                <button style={navBtn} onClick={() => navigate("/profile")}>
                    Profile
                </button>

                <button style={navBtn} onClick={() => navigate("/")}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

/* ─── Features ───────────────── */
const FEATURES = [
    {
        key: "location",
        label: "Current Location",
        route: "/location",
        desc: "View your real-time geographic location",
    },
    {
        key: "aqi",
        label: "AQI",
        route: "/aqi",
        desc: "Check air quality index in your area",
    },
    {
        key: "warning",
        label: "Warning",
        route: "/warning",
        desc: "Environmental risk warnings",
    },
    {
        key: "alert",
        label: "Alert",
        route: "/alert",
        desc: "Real-time hazard alerts",
    },
];

/* ─── Home Page ───────────────── */
export default function ClimateaiHome() {
    const { themeKey } = useContext(ThemeContext);
    const navigate = useNavigate();

    const T = THEMES[themeKey] || THEMES.blue;

    return (
        <>
            <style>{GLOBAL_CSS}</style>

            <div style={{
                minHeight: "100vh",
                background: T.gradient,
                color: T.text,
            }}>
                <Navbar T={T} />

                <main style={{ padding: "60px 24px" }}>
                    <div style={{ maxWidth: 1000,margin: "0 auto" }}>

                        {/* Title */}
                        <h1 style={{
                            textAlign: "center",
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "2.5rem",
                            color: T.accent,
                            marginBottom: 50,
                        }}>
                            Your Environmental Dashboard
                        </h1>

                        {/* Cards */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: 25,
                        }}>
                            {FEATURES.map((feat) => (
                                <div
                                    key={feat.key}
                                    className="feat-card"
                                    onClick={() => navigate(feat.route)}
                                    style={{
                                        background: T.surface,
                                        padding: 30,
                                        borderRadius: 18,
                                        border: `1px solid ${T.subtle}`,
                                        boxShadow: "0 4px 20px rgba(0,0,0,.05)",
                                    }}
                                >
                                    <h2 style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        color: T.primary,
                                        marginBottom: 10,
                                    }}>
                                        {feat.label}
                                    </h2>

                                    <p style={{ color: T.muted }}>
                                        {feat.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}