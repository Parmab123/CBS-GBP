import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import Chatbot from "../../component/chatbot/Chatbot";
import "./Dashboard.css"

// ── JWT decode ────────────────────────────────────────────────────────────────
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return {};
    }
};

// ── Role constants ────────────────────────────────────────────────────────────
const ROLES = {ADMIN: "ADMIN", MANAGER: "MANAGER", OFFICER: "OFFICER"};

const ALL_MODULES = [
    // ── CUSTOMER ──────────────────────────────────────────────────────────────
    {
        id: "customer-ops", label: "Customer Ops", icon: "👤",
        path: "/customers", group: "Customer", color: "#1a6b8a",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
   {
    id: "demand-ops",
    label: "Demand Ops",
    icon: "💳",
    path: "/demand-ops",
    group: "Customer",
    color: "#0f766e",
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
},
    {
        id: "all-customers", label: "All Customers", icon: "👥",
        path: "/customers/all", group: "Customer", color: "#1a6b8a",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "drafts", label: "Draft CIFs", icon: "📋",
        path: "/drafts", group: "Customer", color: "#1a6b8a",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "pending-review", label: "Pending Review", icon: "🕐",
        path: "/customers/manager/pending", group: "Customer", color: "#f59e0b",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },

    // ── KYC & COMPLIANCE ──────────────────────────────────────────────────────
    {
        id: "kyc-ops", label: "KYC Ops", icon: "🪪",
        path: "/kyc", group: "KYC & Compliance", color: "#2d7a4f",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "risk-profile", label: "Risk Profile", icon: "⚖️",
        path: "/risk", group: "KYC & Compliance", color: "#2d7a4f",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "followup", label: "Follow-Up", icon: "📋",
        path: "/followup", group: "KYC & Compliance", color: "#2d7a4f",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "signature", label: "Signature Mgmt", icon: "✍️",
        path: "/signature", group: "KYC & Compliance", color: "#2d7a4f",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },

    // ── APPROVALS (MANAGER + ADMIN only) ─────────────────────────────────────
    {
        id: "approvals", label: "Pending Approvals", icon: "✅",
        path: "/customers/manager/pending", group: "Approvals", color: "#7a4f1a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
        id: "modifications", label: "Modifications", icon: "✏️",
        path: "/modifications", group: "Approvals", color: "#7a4f1a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
        id: "cif-status", label: "CIF Status Change", icon: "🔄",
        path: "/cif-status", group: "Approvals", color: "#7a4f1a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
        id: "close-cif", label: "Close CIF", icon: "🔒",
        path: "/close-cif", group: "Approvals", color: "#7a4f1a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },

    // ── REPORTS ───────────────────────────────────────────────────────────────
    {
        id: "dashboard-stats", label: "Dashboard Stats", icon: "📊",
        path: "/stats", group: "Reports", color: "#4a1a7a",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "recent", label: "Recent Activity", icon: "🕓",
        path: "/recent", group: "Reports", color: "#4a1a7a",
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OFFICER],
    },
    {
        id: "audit", label: "Audit Trail", icon: "📜",
        path: "/audit", group: "Reports", color: "#4a1a7a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
        id: "export", label: "Export Data", icon: "📤",
        path: "/export", group: "Reports", color: "#4a1a7a",
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },

    // ── ADMINISTRATION (ADMIN only) ───────────────────────────────────────────
    {
        id: "user-admin", label: "User Admin", icon: "🛡️",
        path: "/admin/users", group: "Administration", color: "#1a3a7a",
        roles: [ROLES.ADMIN],
    },
    {
        id: "role-mgmt", label: "Role Management", icon: "🔑",
        path: "/admin/roles", group: "Administration", color: "#1a3a7a",
        roles: [ROLES.ADMIN],
    },
    {
        id: "setup", label: "Setup", icon: "⚙️",
        path: "/admin/setup", group: "Administration", color: "#1a3a7a",
        roles: [ROLES.ADMIN],
    },
    {
        id: "preferences", label: "Preferences", icon: "🎛️",
        path: "/admin/preferences", group: "Administration", color: "#1a3a7a",
        roles: [ROLES.ADMIN],
    },
];


const STAT_DEFS = [
    {key: "total", label: "Total CIFs", color: "#c8a96e"},
    {key: "draft", label: "Draft", color: "#8a9bb5"},
    {key: "under_review", label: "Under Review", color: "#e0c94a"},
    {key: "approved", label: "Approved", color: "#4caf88"},
    {key: "rejected", label: "Rejected", color: "#e05252"},
];

// ── Role badge colors ─────────────────────────────────────────────────────────
const ROLE_STYLE = {
    ADMIN: {bg: "rgba(224,82,82,.15)", border: "rgba(224,82,82,.3)", color: "#e05252"},
    MANAGER: {bg: "rgba(200,169,110,.15)", border: "rgba(200,169,110,.3)", color: "#c8a96e"},
    OFFICER: {bg: "rgba(76,175,136,.15)", border: "rgba(76,175,136,.3)", color: "#4caf88"},
};

export default function Dashboard() {
    const navigate = useNavigate();

    // Support both key names — accessToken (new) or token (old)
    const token = useMemo(
        () => localStorage.getItem("accessToken") || localStorage.getItem("token") || "",
        []
    );

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            localStorage.clear();
            navigate("/login", {replace: true});
        }
    }, [token]);

    const payload = useMemo(() => decodeToken(token), [token]);
    const username = payload?.sub || "User";

    // Strip ROLE_ prefix if present e.g. ROLE_MANAGER -> MANAGER
    const rawRole = payload?.role || payload?.roles || payload?.authority || "OFFICER";
    const roleStr = Array.isArray(rawRole) ? rawRole[0] : String(rawRole);
    const role = roleStr.replace(/^ROLE_/i, "").toUpperCase();

    const [stats, setStats] = useState(null);
    const [statsErr, setStatsErr] = useState(false);
    const [time, setTime] = useState(new Date());
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);


    // ── Pages built so far — add path here when page is ready ────────────────
    const builtRoutes = [
        "/dashboard",
        "/customers",         // Customer Search
        "/customers/create",  // Customer Onboarding
        "/customers/all",     // All Customers
        "/customers/manager/pending",
        "/kyc",               // KYC Operations
        "/drafts",
        "/followup",          // Follow-Up
        "/signature",         // Signature Management
    ];

    const handleTileClick = (mod) => {
        if (builtRoutes.includes(mod.path)) {
            navigate(mod.path);
        } else {
            setToast(mod.label + " — Coming Soon");
            setTimeout(() => setToast(null), 2500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login", {replace: true});
    };

    // clock
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // stats
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("http://localhost:8080/api/customers/dashboard-stats", {
                    headers: {Authorization: "Bearer " + token},
                });
                if (!res.ok) {
                    const err = await res.text();
                    console.error("Stats API error:", res.status, err);
                    setStatsErr(true);
                    return;
                }
                setStats(await res.json());
            } catch (e) {
                console.error("Stats fetch failed:", e);
                setStatsErr(true);
            }
        })();
    }, []);

    // ── Filter modules by role then by search ────────────────────────────────
    const visibleModules = ALL_MODULES.filter((m) => m.roles.includes(role));

    // group them
    const groupOrder = ["Customer", "KYC & Compliance", "Approvals", "Reports", "Administration"];
    const grouped = groupOrder
        .map((g) => ({
            label: g,
            color: visibleModules.find((m) => m.group === g)?.color || "#333",
            modules: visibleModules
                .filter((m) => m.group === g)
                .filter((m) => m.label.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((g) => g.modules.length > 0);


    const fmt12 = (d) => d.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit", second: "2-digit"});
    const fmtDate = (d) => d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const rs = ROLE_STYLE[role] || ROLE_STYLE.OFFICER;

    return (
        <>
            <style>{`
       `}</style>

            <div className="db-root">

                {/* ── NAV ── */}
                <nav className="db-nav">
                    <div className="db-logo">CBS</div>
                    <div className="db-divider"/>
                    <div className="db-crumb">
                        <span>Home</span><span>›</span>
                        <span className="active">Dashboard</span>
                    </div>
                    <div className="db-nav-r">
                        <div className="db-clock">
                            <div className="t">{fmt12(time)}</div>
                            <div>{fmtDate(time)}</div>
                        </div>
                        <div className="db-divider"/>
                        <div className="db-user">
                            <div className="db-av">{username.slice(0, 2).toUpperCase()}</div>
                            <div>
                                <div className="db-un">{username}</div>
                                <div
                                    className="db-role-badge"
                                    style={{background: rs.bg, border: "1px solid " + rs.border, color: rs.color}}
                                >
                                    {role}
                                </div>
                            </div>
                        </div>
                        <button className="db-logout" onClick={handleLogout}>Sign Out</button>
                    </div>
                </nav>

                {/* ── STATS ── */}
                <div className="db-stats">
                    {STAT_DEFS.map((s) => {
                        const val = stats ? (stats[s.key] ?? "—") : "…";
                        const pct = stats ? Math.round(((stats[s.key] || 0) / (stats.total || 1)) * 100) : 0;
                        return (
                            <div className="db-stat" key={s.key}>
                                <div className="db-slbl">{s.label}</div>
                                <div className="db-sval" style={{color: s.color}}>
                                    {statsErr ? "—" : val}
                                </div>
                                <div className="db-sbar">
                                    <div className="db-sfill" style={{width: pct + "%", background: s.color}}/>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── TOOLBAR ── */}
                <div className="db-toolbar">
                    <div className="db-search-wrap">
                        <svg className="db-sico" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            className="db-search"
                            type="text"
                            placeholder="Search modules..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="db-module-count">
                        {visibleModules.length} modules available
                    </div>
                </div>

                {/* ── SCROLLABLE TILE AREA ── */}
                <div className="db-scroll">
                    {grouped.length === 0 && (
                        <div className="db-empty">No modules found for "{search}"</div>
                    )}

                    {grouped.map((group, gi) => (
                        <div className="db-group" key={group.label}>
                            <div className="db-glbl">{group.label}</div>
                            <div className="db-tiles">
                                {group.modules.map((mod, mi) => (
                                    <div
                                        key={mod.id}
                                        className="db-tile"
                                        style={{
                                            background: "linear-gradient(135deg," + mod.color + "cc 0%," + mod.color + "88 100%)",
                                            animationDelay: (gi * 5 + mi) * 0.035 + "s",
                                        }}
                                        onClick={() => handleTileClick(mod)}
                                        title={mod.label}
                                    >
                                        <div className="db-ticon">{mod.icon}</div>
                                        <div className="db-tlbl">{mod.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {toast && <div className="db-toast">🚧 {toast}</div>}


            <Chatbot/>
        </>
    );
}