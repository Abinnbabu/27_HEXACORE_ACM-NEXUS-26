import { useContext } from "react";
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

/* ─── Dashboard Placeholders (backend integrated later) ───────────────── */
const DASHBOARD_DATA = {
    currentLocation: "Fetching location...",
    aqi: "--",
    alertMessage: "No active alerts right now",
    warningMessage: "Tap to view environmental warnings",
};

/* ─── Home Page ───────────────── */
export default function ClimateaiHome() {
    const { themeKey } = useContext(ThemeContext);
    const navigate = useNavigate();

    const T = THEMES[themeKey] || THEMES.blue;
    const panelButtonStyle = {
        width: "100%",
        textAlign: "left",
        background: T.surface,
        border: `1px solid ${T.subtle}`,
        borderRadius: 16,
        padding: "18px 16px",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,.05)",
    };

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

                        {/* Dashboard panels */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(300px, 2fr) minmax(220px, 1fr)",
                            gap: 25,
                            alignItems: "stretch",
                        }}>
                            <div
                                className="feat-card"
                                onClick={() => navigate("/location")}
                                style={{
                                    background: T.surface,
                                    padding: 30,
                                    borderRadius: 18,
                                    border: `1px solid ${T.subtle}`,
                                    boxShadow: "0 4px 20px rgba(0,0,0,.05)",
                                    minHeight: 360,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <h2 style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    color: T.primary,
                                    marginBottom: 10,
                                }}>
                                    Current Location
                                </h2>

                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 12,
                                    borderRadius: 14,
                                    border: `1px dashed ${T.subtle}`,
                                    background: T.card,
                                    padding: 20,
                                    textAlign: "center",
                                }}>
                                    <p style={{
                                        color: T.muted,
                                        fontSize: "1rem",
                                    }}>
                                        {DASHBOARD_DATA.currentLocation}
                                    </p>
                                </div>

                                <p style={{
                                    color: T.muted,
                                    marginTop: 14,
                                    fontSize: "0.9rem",
                                }}>
                                    Location will be shown here after backend integration.
                                </p>
                            </div>

                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 14,
                            }}>
                                <button
                                    className="feat-card"
                                    onClick={() => navigate("/aqi")}
                                    style={panelButtonStyle}
                                >
                                    <h2 style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        color: T.primary,
                                        marginBottom: 6,
                                        fontSize: "1.2rem",
                                    }}>
                                        AQI
                                    </h2>
                                    <p style={{ color: T.muted }}>
                                        Air Quality Index: {DASHBOARD_DATA.aqi}
                                    </p>
                                </button>

                                <div style={panelButtonStyle}>
                                    <h2 style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        color: T.primary,
                                        marginBottom: 6,
                                        fontSize: "1.2rem",
                                    }}>
                                        Alert
                                    </h2>
                                    <p
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => navigate("/alert")}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                navigate("/alert");
                                            }
                                        }}
                                        style={{
                                            color: T.muted,
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                            textUnderlineOffset: 3,
                                        }}
                                    >
                                        {DASHBOARD_DATA.alertMessage}
                                    </p>
                                </div>

                                <button
                                    className="feat-card"
                                    onClick={() => navigate("/warning")}
                                    style={panelButtonStyle}
                                >
                                    <h2 style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        color: T.primary,
                                        marginBottom: 6,
                                        fontSize: "1.2rem",
                                    }}>
                                        Warnings
                                    </h2>
                                    <p style={{ color: T.muted }}>
                                        {DASHBOARD_DATA.warningMessage}
                                    </p>
                                </button>

                                <button
                                    className="feat-card"
                                    onClick={() => navigate("/survey")}
                                    style={panelButtonStyle}
                                >
                                    <h2 style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        color: T.primary,
                                        marginBottom: 6,
                                        fontSize: "1.2rem",
                                    }}>
                                        Survey
                                    </h2>
                                    <p style={{ color: T.muted }}>
                                        Share your environmental observations
                                    </p>
                                </button>
                            </div>
                        </div>


                    </div>
                </main>
            </div>
        </>
    );
}