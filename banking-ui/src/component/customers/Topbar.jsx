import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const getUser = () => {
    try {
        const t = localStorage.getItem("accessToken");
        const p = JSON.parse(atob(t.split(".")[1]));
        return {name: p.sub || "User", role: (p.role || "").replace(/^ROLE_/i, "").toUpperCase()};
    } catch {
        return {name: "User", role: ""};
    }
};

const ROLE_COLOR = {
    OFFICER: {bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.3)", color: "#60a5fa"},
    MANAGER: {bg: "rgba(168,85,247,.15)", border: "rgba(168,85,247,.3)", color: "#c084fc"},
    ADMIN: {bg: "rgba(239,68,68,.15)", border: "rgba(239,68,68,.3)", color: "#f87171"},
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TopBar({breadcrumb = []}) {
    const navigate = useNavigate();
    const {name, role} = getUser();
    const rc = ROLE_COLOR[role] || ROLE_COLOR.OFFICER;

    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const hh = time.getHours();
    const mm = String(time.getMinutes()).padStart(2, "0");
    const ss = String(time.getSeconds()).padStart(2, "0");
    const ampm = hh >= 12 ? "pm" : "am";
    const hh12 = String(hh % 12 || 12).padStart(2, "0");
    const day = DAYS[time.getDay()];
    const dd = String(time.getDate()).padStart(2, "0");
    const mon = MONTHS[time.getMonth()];
    const yyyy = time.getFullYear();

    const initials = name.slice(0, 2).toUpperCase();

    const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 24px", height: 48,
            background: "#0a1628",
            borderBottom: "1px solid rgba(200,169,110,.15)",
            fontFamily: "IBM Plex Sans,sans-serif",
            position: "sticky", top: 0, zIndex: 100,
        }}>
            {/* LOGO */}
            <div style={{display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0}}
                 onClick={() => navigate("/dashboard")}>
        <span style={{
            fontFamily: "IBM Plex Mono,monospace", fontWeight: 700, fontSize: "1rem",
            color: "#c8a96e", letterSpacing: ".05em"
        }}>CBS</span>
            </div>

            {/* DIVIDER */}
            <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>

            {/* BREADCRUMB */}
            <div style={{display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem", color: "#6b7a99"}}>
        <span style={{cursor: "pointer", color: "#8a9bb5"}}
              onClick={() => navigate("/dashboard")}>Home</span>
                {breadcrumb.map((b, i) => (
                    <span key={i} style={{display: "flex", alignItems: "center", gap: 5}}>
            <span style={{color: "#4a5568"}}>›</span>
            <span style={{
                cursor: b.path ? "pointer" : "default",
                color: i === breadcrumb.length - 1 ? "#c8a96e" : "#8a9bb5",
                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
            }}
                  onClick={() => b.path && navigate(b.path)}>
              {b.label}
            </span>
          </span>
                ))}
            </div>

            {/* RIGHT SIDE */}
            <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 14}}>

                {/* CLOCK */}
                <div style={{textAlign: "right", lineHeight: 1.3}}>
                    <div style={{
                        fontFamily: "IBM Plex Mono,monospace",
                        fontSize: ".78rem",
                        color: "#c8a96e",
                        fontWeight: 600
                    }}>
                        {hh12}:{mm}:{ss} <span style={{fontSize: ".65rem", color: "#8a9bb5"}}>{ampm}</span>
                    </div>
                    <div style={{fontSize: ".65rem", color: "#6b7a99"}}>
                        {day}, {dd} {mon} {yyyy}
                    </div>
                </div>

                {/* DIVIDER */}
                <div style={{width: 1, height: 28, background: "rgba(255,255,255,.08)"}}/>

                {/* USER */}
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,#1a3a5c,#0e1117)",
                        border: "1.5px solid rgba(200,169,110,.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".65rem", fontWeight: 700, color: "#c8a96e", flexShrink: 0
                    }}>
                        {initials}
                    </div>
                    <div style={{lineHeight: 1.3}}>
                        <div style={{fontSize: ".78rem", fontWeight: 600, color: "#e2e8f0"}}>{name}</div>
                        <div style={{
                            display: "inline-flex", padding: "1px 6px", borderRadius: 3,
                            fontSize: ".6rem", fontWeight: 700, letterSpacing: ".04em",
                            background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color
                        }}>
                            {role}
                        </div>
                    </div>
                </div>

                {/* SIGN OUT */}
                <button onClick={handleSignOut}
                        style={{
                            padding: "5px 14px", borderRadius: 5, cursor: "pointer",
                            fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".72rem", fontWeight: 600,
                            background: "rgba(224,92,92,.1)", border: "1px solid rgba(224,92,92,.3)",
                            color: "#e05c5c", transition: "all .2s", flexShrink: 0
                        }}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}