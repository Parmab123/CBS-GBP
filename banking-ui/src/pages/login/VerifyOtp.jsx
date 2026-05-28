import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./verify-otp.css"
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

export default function VerifyOtp() {

    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // 1 Minute Timer
    const [timeLeft, setTimeLeft] = useState(60);

    const sessionId = localStorage.getItem("otpSessionId");
    const maskedMobile = localStorage.getItem("maskedMobile");

    /*
     * ───────────────────────────────
     * OTP COUNTDOWN TIMER
     * ───────────────────────────────
     */

    useEffect(() => {

        const interval = setInterval(() => {

            const expiry =
                localStorage.getItem("otpExpiry");

            if (!expiry) return;

            const remaining =
                Math.floor(
                    (expiry - Date.now()) / 1000
                );

            if (remaining <= 0) {

                setTimeLeft(0);
                clearInterval(interval);

            } else {

                setTimeLeft(remaining);
            }

        }, 1000);

        return () => clearInterval(interval);

    }, []);

    /*
     * ───────────────────────────────
     * FORMAT TIMER
     * ───────────────────────────────
     */

    const formatTime = () => {

        const minutes =
            String(Math.floor(timeLeft / 60))
                .padStart(2, "0");

        const seconds =
            String(timeLeft % 60)
                .padStart(2, "0");

        return `${minutes}:${seconds}`;
    };

    /*
     * ───────────────────────────────
     * VERIFY OTP
     * ───────────────────────────────
     */

    const handleVerify = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const res = await api.post(
                "/api/auth/verify-otp",
                {
                    sessionId,
                    otp
                }
            );

            localStorage.setItem(
                "accessToken",
                res.data.accessToken
            );

            localStorage.setItem(
                "refreshToken",
                res.data.refreshToken
            );

            navigate("/dashboard");

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                "Invalid OTP"
            );

        } finally {

            setLoading(false);
        }
    };

    /*
     * ───────────────────────────────
     * RESEND OTP
     * ───────────────────────────────
     */

    const handleResendOtp = async () => {

        try {

            setResending(true);
            setError("");
            setMessage("");

            const res = await api.post(
                "/api/auth/resend-otp",
                {
                    sessionId
                }
            );

            setMessage(res.data.message);

            // RESET TIMER
            localStorage.setItem(
                "otpExpiry",
                Date.now() + (60 * 1000)
            );

            setTimeLeft(60);

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                "Failed to resend OTP"
            );

        } finally {

            setResending(false);
        }
    };

    return (
        <>
            <style>{`

             

            `}</style>

            <div className="otp-root">

                <div className="otp-card">

                    <div className="otp-logo">

                        <div className="otp-icon">
                            SB
                        </div>

                        <div>

                            <div style={{
                                color: "white",
                                fontSize: "22px",
                                fontWeight: "700"
                            }}>
                                SecureBank
                            </div>

                            <div style={{
                                color: "#f5d76e",
                                fontSize: "12px",
                                letterSpacing: "2px"
                            }}>
                                OTP VERIFICATION
                            </div>

                        </div>

                    </div>

                    <div className="otp-title">
                        Verify Identity
                    </div>

                    <div className="otp-sub">
                        We sent a 6-digit OTP to your registered mobile number
                    </div>

                    <div className="otp-mobile">
                        {maskedMobile}
                    </div>

                    <form onSubmit={handleVerify}>

                        <input
                            type="text"
                            maxLength="6"
                            className="otp-input"
                            placeholder="••••••"
                            value={otp}
                            onChange={(e) =>
                                setOtp(
                                    e.target.value.replace(/\D/g, "")
                                )
                            }
                        />

                        <div className="otp-row">

                            <div className="otp-time">
                                OTP expires in {formatTime()}
                            </div>

                            <button
                                type="button"
                                className="otp-resend"
                                onClick={handleResendOtp}
                                disabled={resending || timeLeft > 0}
                            >
                                {
                                    resending
                                        ? "Sending..."
                                        : "Resend OTP"
                                }
                            </button>

                        </div>

                        <button
                            type="submit"
                            className="otp-btn"
                            disabled={loading}
                        >
                            {
                                loading
                                    ? "VERIFYING..."
                                    : "VERIFY & CONTINUE"
                            }
                        </button>

                    </form>

                    {
                        error &&
                        <div className="otp-error">
                            {error}
                        </div>
                    }

                    {
                        message &&
                        <div className="otp-success">
                            {message}
                        </div>
                    }

                    <div className="otp-secure">
                        🔒 Your OTP is encrypted and valid only for this session.
                    </div>

                </div>

            </div>
        </>
    );
}

