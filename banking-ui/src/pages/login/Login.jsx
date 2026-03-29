import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: "http://localhost:8080",       // 👈 change to your backend URL
    headers: {"Content-Type": "application/json"},
});

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);   // { type, message, remaining, seconds }
    const [countdown, setCountdown] = useState(null);   // live lock countdown

    // ── Lock countdown timer ──────────────────────────────────────────────────
    const startCountdown = (seconds) => {
        setCountdown(seconds);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setError(null);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password) {
            setError({type: "VALIDATION", message: "Please enter your username and password."});
            return;
        }

        setLoading(true);
        try {
            // POST /api/auth/login  →  { accessToken, refreshToken }
            const res = await api.post("/api/auth/login", {username, password});

            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            navigate("/dashboard");

        } catch (err) {
            const data = err?.response?.data;

            if (!data) {
                setError({type: "NETWORK", message: "Unable to connect. Please try again."});
                return;
            }

            // error codes from AuthException / ErrorResponse DTO
            switch (data.error) {
                case "ACCOUNT_LOCKED":
                    setError({
                        type: "ACCOUNT_LOCKED",
                        message: data.message,
                        seconds: data.remainingSeconds,
                    });
                    if (data.remainingSeconds) startCountdown(data.remainingSeconds);
                    break;

                case "INVALID_CREDENTIALS":
                    setError({
                        type: "INVALID_CREDENTIALS",
                        message: data.message,
                        remaining: data.remainingAttempts,
                    });
                    break;

                default:
                    setError({type: "ERROR", message: data.message || "Something went wrong."});
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Error banner content ──────────────────────────────────────────────────
    const renderError = () => {
        if (!error) return null;

        let icon, msg, sub;

        if (error.type === "ACCOUNT_LOCKED") {
            icon = "🔒";
            msg = "Account Locked";
            sub = countdown
                ? `Try again in ${formatTime(countdown)}`
                : error.message;
        } else if (error.type === "INVALID_CREDENTIALS") {
            icon = "⚠";
            msg = error.message;
            sub = error.remaining > 0
                ? `${error.remaining} attempt${error.remaining !== 1 ? "s" : ""} remaining`
                : null;
        } else {
            icon = "✕";
            msg = error.message;
            sub = null;
        }

        return (
            <div className="lb-error">
                <span className="lb-error-icon">{icon}</span>
                <div>
                    <div className="lb-error-msg">{msg}</div>
                    {sub && <div className="lb-error-sub">{sub}</div>}
                </div>
            </div>
        );
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

        :root {
          --navy:   #0a1628;
          --gold:   #c8a96e;
          --gold-lt:#e0c98a;
          --muted:  #8a9bb5;
          --border: rgba(200,169,110,0.2);
          --error:  #e05252;
          --locked: #e07b32;
        }

        .lb-root {
          position: fixed; inset: 0;
          font-family: 'Source Sans 3', sans-serif;
          display: flex; align-items: center; justify-content: center;
          background: var(--navy); overflow: hidden;
        }

        /* background */
        .lb-bg { position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(135deg,#060d1a 0%,#0a1628 45%,#0d1f3c 75%,#091525 100%); }
        .lb-bg::before { content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 55% at 75% 15%, rgba(26,52,96,.5) 0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 10% 85%, rgba(200,169,110,.07) 0%, transparent 55%); }
        .lb-bg::after { content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(200,169,110,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,110,.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%); }

        /* card */
        .lb-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 400px; margin: 16px;
          background: rgba(10,22,40,0.82);
          border: 1px solid var(--border); border-radius: 18px;
          padding: 44px 40px 36px;
          backdrop-filter: blur(18px);
          box-shadow: 0 32px 80px rgba(0,0,0,.5);
          animation: cardIn .7s cubic-bezier(.22,.97,.42,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(24px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* brand */
        .lb-brand { display:flex; align-items:center; gap:12px; margin-bottom:32px; }
        .lb-brand-icon {
          width:40px; height:40px;
          background: linear-gradient(135deg, var(--gold), var(--gold-lt));
          border-radius:10px; display:flex; align-items:center; justify-content:center; }
        .lb-brand-icon svg { width:20px; height:20px; fill:var(--navy); }
        .lb-brand-name { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:700; color:#fff; line-height:1.1; }
        .lb-brand-sub  { font-size:.68rem; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); }

        .lb-title    { font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:700; color:#fff; margin-bottom:6px; }
        .lb-subtitle { font-size:.88rem; color:var(--muted); font-weight:300; margin-bottom:28px; }

        /* error banner */
        .lb-error {
          border-radius:8px; padding:12px 14px; font-size:.82rem;
          margin-bottom:18px; display:flex; align-items:flex-start; gap:10px;
          animation: shake .4s ease;
          background: rgba(224,82,82,.1); border: 1px solid rgba(224,82,82,.25); color: var(--error);
        }
        .lb-error.locked {
          background: rgba(224,123,50,.1); border-color: rgba(224,123,50,.3); color: var(--locked);
        }
        .lb-error-icon { font-size:1rem; margin-top:1px; flex-shrink:0; }
        .lb-error-msg  { font-weight:500; line-height:1.4; }
        .lb-error-sub  { font-size:.76rem; margin-top:3px; opacity:.85; }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)}
        }

        /* attempts indicator */
        .lb-attempts {
          display:flex; gap:5px; margin-bottom:18px;
        }
        .lb-attempt-dot {
          width:8px; height:8px; border-radius:50%;
          background: rgba(200,169,110,.25);
          transition: background .3s;
        }
        .lb-attempt-dot.used { background: var(--error); }

        /* fields */
        .lb-field { margin-bottom:18px; }
        .lb-label { display:block; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:500; margin-bottom:7px; }
        .lb-input-wrap { position:relative; }
        .lb-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%);
          width:15px; height:15px; stroke:var(--muted); fill:none; stroke-width:1.8;
          pointer-events:none; transition:stroke .2s; }
        .lb-input {
          width:100%; padding:13px 14px 13px 40px;
          background:rgba(255,255,255,.04); border:1px solid rgba(200,169,110,.15);
          border-radius:9px; color:#fff;
          font-family:'Source Sans 3',sans-serif; font-size:.95rem;
          outline:none; transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .lb-input::placeholder { color:rgba(138,155,181,.55); }
        .lb-input:focus { border-color:var(--gold); background:rgba(200,169,110,.06); box-shadow:0 0 0 3px rgba(200,169,110,.12); }
        .lb-input:disabled { opacity:.5; cursor:not-allowed; }
        .lb-input:focus + .lb-icon { stroke:var(--gold); }
        .lb-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:var(--muted); padding:0;
          display:flex; transition:color .2s; }
        .lb-eye:hover { color:var(--gold); }
        .lb-eye svg { width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:1.8; }

        .lb-row { display:flex; align-items:center; justify-content:space-between; margin:4px 0 22px; }
        .lb-remember { display:flex; align-items:center; gap:7px; font-size:.8rem; color:var(--muted); cursor:pointer; user-select:none; }
        .lb-remember input[type=checkbox] {
          appearance:none; width:15px; height:15px; padding:0;
          border:1px solid rgba(200,169,110,.3); border-radius:4px;
          background:rgba(255,255,255,.04); cursor:pointer; position:relative; transition:all .2s; }
        .lb-remember input:checked { background:var(--gold); border-color:var(--gold); }
        .lb-remember input:checked::after { content:''; position:absolute; left:3px; top:1px; width:5px; height:8px;
          border:2px solid var(--navy); border-top:none; border-left:none; transform:rotate(40deg); }
        .lb-forgot { font-size:.8rem; color:var(--gold); text-decoration:none; font-weight:500; transition:opacity .2s; }
        .lb-forgot:hover { opacity:.75; }

        /* button */
        .lb-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%);
          color:var(--navy); border:none; border-radius:9px;
          font-family:'Source Sans 3',sans-serif; font-size:.88rem;
          font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform .15s, box-shadow .2s, filter .2s;
        }
        .lb-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(200,169,110,.35); filter:brightness(1.05); }
        .lb-btn:active:not(:disabled) { transform:translateY(0); box-shadow:none; }
        .lb-btn:disabled { opacity:.6; cursor:not-allowed; }
        .lb-spinner { width:16px; height:16px; border:2px solid rgba(10,22,40,.25);
          border-top-color:var(--navy); border-radius:50%; animation:spin .7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* security note */
        .lb-security { margin-top:20px; padding:10px 13px;
          background:rgba(200,169,110,.05); border:1px solid rgba(200,169,110,.12);
          border-radius:7px; display:flex; align-items:flex-start; gap:9px;
          font-size:.74rem; color:var(--muted); line-height:1.5; }
        .lb-security svg { flex-shrink:0; margin-top:1px; width:13px; height:13px; stroke:var(--gold); fill:none; stroke-width:1.8; }
      `}</style>

            <div className="lb-root">
                <div className="lb-bg"/>

                <div className="lb-card">

                    {/* Brand */}
                    <div className="lb-brand">
                        <div className="lb-brand-icon">
                            <svg viewBox="0 0 24 24">
                                <path
                                    d="M12 2L2 7v1h20V7L12 2zM4 10v7h2v-7H4zm6 0v7h2v-7h-2zm6 0v7h2v-7h-2zM2 19v2h20v-2H2z"/>
                            </svg>
                        </div>
                        <div>
                            <div className="lb-brand-name">SecureBank</div>
                            <div className="lb-brand-sub">Core Banking System</div>
                        </div>
                    </div>

                    <h1 className="lb-title">Welcome back</h1>
                    <p className="lb-subtitle">Sign in to access your account</p>

                    {/* Error banner */}
                    {error && (
                        <div className={`lb-error ${error.type === "ACCOUNT_LOCKED" ? "locked" : ""}`}>
              <span className="lb-error-icon">
                {error.type === "ACCOUNT_LOCKED" ? "🔒" : error.type === "INVALID_CREDENTIALS" ? "⚠" : "✕"}
              </span>
                            <div>
                                <div className="lb-error-msg">
                                    {error.type === "ACCOUNT_LOCKED" ? "Account Locked" : error.message}
                                </div>
                                {error.type === "ACCOUNT_LOCKED" && countdown && (
                                    <div className="lb-error-sub">Try again in {formatTime(countdown)}</div>
                                )}
                                {error.type === "INVALID_CREDENTIALS" && error.remaining > 0 && (
                                    <div className="lb-error-sub">
                                        {error.remaining} attempt{error.remaining !== 1 ? "s" : ""} remaining
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attempts dots — show only when remaining is known */}
                    {error?.type === "INVALID_CREDENTIALS" && (
                        <div className="lb-attempts">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`lb-attempt-dot ${i >= error.remaining ? "used" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Username */}
                        <div className="lb-field">
                            <label className="lb-label" htmlFor="username">Username</label>
                            <div className="lb-input-wrap">
                                <input
                                    id="username"
                                    className="lb-input"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    disabled={loading || error?.type === "ACCOUNT_LOCKED"}
                                />
                                <svg className="lb-icon" viewBox="0 0 24 24">
                                    <circle cx="12" cy="8" r="4"/>
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                </svg>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="lb-field">
                            <label className="lb-label" htmlFor="password">Password</label>
                            <div className="lb-input-wrap">
                                <input
                                    id="password"
                                    className="lb-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={loading || error?.type === "ACCOUNT_LOCKED"}
                                />
                                <svg className="lb-icon" viewBox="0 0 24 24">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <button
                                    type="button"
                                    className="lb-eye"
                                    onClick={() => setShowPassword(v => !v)}
                                    disabled={loading}
                                >
                                    {showPassword
                                        ? <svg viewBox="0 0 24 24">
                                            <path
                                                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                        : <svg viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="lb-row">
                            <label className="lb-remember">
                                <input type="checkbox"/>
                                Remember this device
                            </label>
                            <a href="#" className="lb-forgot">Forgot password?</a>
                        </div>

                        <button
                            className="lb-btn"
                            type="submit"
                            disabled={loading || error?.type === "ACCOUNT_LOCKED"}
                        >
                            {loading
                                ? <>
                                    <div className="lb-spinner"/>
                                    Signing in…</>
                                : "Sign In Securely"
                            }
                        </button>

                    </form>

                    <div className="lb-security">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Your connection is encrypted. We will never ask for your full password by email or phone.
                    </div>

                </div>
            </div>
        </>
    );
}