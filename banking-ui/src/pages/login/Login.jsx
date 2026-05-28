import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./login.css";
// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {"Content-Type": "application/json"},
});

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);


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

        const res = await api.post(
            "/api/auth/login",
            {
                username,
                password
            }
        );

        localStorage.setItem(
            "otpSessionId",
            res.data.sessionId
        );

        localStorage.setItem(
            "maskedMobile",
            res.data.maskedMobile
        );

        localStorage.setItem(
            "otpExpiry",
            Date.now() + (60 * 1000)
        );

        navigate("/verify-otp");

    }
catch (err) {
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