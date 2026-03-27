import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login,register } from "../api";

/* ─── Fixed Theme ───────────────────────── */
const T = {
  bg: "#F0F6FF",
  surface: "#FFFFFF",
  primary: "#2255A4",
  accent: "#1A3F7A",
  muted: "#6B8BBF",
  text: "#0F2040",
  subtle: "#D8E8FF",
  gradient: "linear-gradient(160deg, #F7FAFF 0%, #E8F0FC 50%, #F0F6FF 100%)",
};

/* ─── Global CSS ───────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }

  .login-input:focus { outline: none; }
  .cta-btn { transition: all .2s ease; cursor: pointer; }
  .cta-btn:hover { opacity: .92; }
`;

/* ─── Main Component ───────────────────── */
export default function ClimateAi() {
  const [isLogin,setIsLogin] = useState(true);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [fullName,setFullName] = useState("");

  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(prev => !prev);
    setError("");
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(email,password);

        if (data.user.role === "admin") navigate("/adminpage");
        else if (data.user.role === "doctor") navigate("/doctorpage");
        else navigate("/home");
      } else {
        if (!fullName || !email || !password) {
          setError("Please fill in all fields");
          return;
        }

        await register(fullName,email,password);
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    borderRadius: 12,
    padding: "12px 16px",
    border: `1.5px solid ${T.subtle}`,
    background: T.surface,
    color: T.text,
    fontSize: "0.92rem",
    marginBottom: 12,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: "100vh",
        background: T.gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>

        <div style={{
          background: T.surface,
          borderRadius: 24,
          padding: "48px 44px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 16px 56px rgba(0,0,0,.08)",
          border: `1px solid ${T.subtle}`,
        }}>

          {/* Title */}
          <div style={{ textAlign: "center",marginBottom: 30 }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              color: T.primary
            }}>
              Climate AI
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>

            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={inputStyle}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle,marginBottom: 20 }}
            />

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="cta-btn"
              style={{
                width: "100%",
                background: T.primary,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "12px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </button>

            {error && (
              <p style={{ color: "red",marginTop: 10,textAlign: "center" }}>
                {error}
              </p>
            )}

          </form>

          {/* Toggle */}
          <p style={{ textAlign: "center",marginTop: 20 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={toggleForm}
              style={{ color: T.primary,cursor: "pointer",fontWeight: 500 }}
            >
              {isLogin ? "Create account" : "Sign in"}
            </span>
          </p>

        </div>
      </div>
    </>
  );
}