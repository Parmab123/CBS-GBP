import {useEffect, useState} from "react";
import TopBar from "../TopBar";
import {useNavigate} from "react-router-dom";
import "./pendingapprovals.css";

const BASE = "http://localhost:8080";
const token = () => localStorage.getItem("accessToken");
const getUser = () => {
    try {
        return JSON.parse(atob(token().split(".")[1])).sub || "manager";
    } catch {
        return "manager";
    }
};

const api = async (method, path, body) => {
    const res = await fetch(BASE + path, {
        method,
        headers: {"Content-Type": "application/json", Authorization: "Bearer " + token()},
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        try {
            const e = await res.json();
            throw new Error(e.message || "Request failed");
        } catch {
            throw new Error("Request failed: " + res.status);
        }
    }
    try {
        return await res.json();
    } catch {
        return {};
    }
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"}) : "—";
const fmtKey = (k) => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const parseJson = (s) => {
    try {
        return JSON.parse(s);
    } catch {
        return {};
    }
};

const STATUS_COLORS = {
    UNDER_REVIEW: {color: "#f59e0b", bg: "rgba(245,158,11,.1)", label: "Under Review"},
    APPROVED: {color: "#48c78e", bg: "rgba(72,199,142,.1)", label: "Approved"},
    REJECTED: {color: "#e05c5c", bg: "rgba(224,92,92,.1)", label: "Rejected"},
    DRAFT: {color: "#6b7a99", bg: "rgba(107,122,153,.1)", label: "Draft"},
    PENDING_MODIFICATION: {color: "#f59e0b", bg: "rgba(245,158,11,.1)", label: "Pending Modification"},
    CHANGES_REQUESTED: {color: "#a78bfa", bg: "rgba(167,139,250,.1)", label: "Changes Requested"},
    CLOSED: {color: "#6b7a99", bg: "rgba(107,122,153,.1)", label: "Closed"},
};

const SECTION_ICON = {BASIC_INFO: "👤", ADDRESS: "🏠", NOMINEE: "👥", INCOME: "💰", KYC: "🪪", RISK: "⚠️"};

export default function PendingApprovals() {
    const navigate = useNavigate();

    // Tab
    const [activeTab, setActiveTab] = useState("cif"); // "cif" | "mod"

    // CIF Approvals
    const [cifList, setCifList] = useState([]);
    const [cifLoading, setCifLoading] = useState(true);

    // Modification Requests
    const [modList, setModList] = useState([]);
    const [modLoading, setModLoading] = useState(true);

    // CASA Account Approvals
    const [casaList, setCasaList] = useState([]);
    const [casaLoading, setCasaLoading] = useState(true);

    // CASA Modal
    const [selectedCasa, setSelectedCasa] = useState(null);
    const [casaRemarks, setCasaRemarks] = useState("");
    const [casaActing, setCasaActing] = useState(null);
    const [casaMsg, setCasaMsg] = useState("");

    const [error, setError] = useState("");

    // CIF Modal
    const [selectedCif, setSelectedCif] = useState(null);
    const [cifDetail, setCifDetail] = useState(null);
    const [cifDetailLoad, setCifDetailLoad] = useState(false);
    const [cifAction, setCifAction] = useState("");
    const [cifRemarks, setCifRemarks] = useState("");
    const [cifSubmitting, setCifSubmitting] = useState(false);
    const [cifMsg, setCifMsg] = useState("");

    // Mod Modal
    const [selectedMod, setSelectedMod] = useState(null);
    const [modRemarks, setModRemarks] = useState("");
    const [modActing, setModActing] = useState(null);
    const [modMsg, setModMsg] = useState("");

    // ── Fetch both lists ──────────────────────────────────────────────────────
    const fetchAll = async () => {
        setError("");
        // CIF
        setCifLoading(true);
        try {
            const data = await api("GET", "/api/customers/pending-approvals");
            setCifList(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCifLoading(false);
        }

        // Modifications
        setModLoading(true);
        try {
            const data = await api("GET", "/api/customers/modifications/pending");
            setModList(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setModLoading(false);
        }

        // CASA Approvals
        setCasaLoading(true);
        try {
            const data = await api("GET", "/api/casa/pending");
            setCasaList(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCasaLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // ── CIF Actions ───────────────────────────────────────────────────────────
    const openCifDetail = async (cifId) => {
        setSelectedCif(cifId);
        setCifDetail(null);
        setCifAction("");
        setCifRemarks("");
        setCifMsg("");
        setCifDetailLoad(true);
        try {
            setCifDetail(await api("GET", `/api/customers/${cifId}`));
        } catch (e) {
            setError(e.message);
        } finally {
            setCifDetailLoad(false);
        }
    };

    const submitCifAction = async () => {
        if (!cifAction) return;
        if (cifAction === "REJECTED" && !cifRemarks.trim())
            return setCifMsg("Remarks required for rejection.");
        setCifSubmitting(true);
        setCifMsg("");
        try {
            await api("PUT", `/api/customers/${selectedCif}/approve`, {
                newStatus: cifAction, changedBy: getUser(), remarks: cifRemarks,
            });
            setCifMsg(cifAction === "APPROVED" ? "✓ Customer approved!" : "✓ Customer rejected.");
            setTimeout(() => {
                setSelectedCif(null);
                fetchAll();
            }, 1500);
        } catch (e) {
            setCifMsg("⚠ " + e.message);
        } finally {
            setCifSubmitting(false);
        }
    };

    // ── Mod Actions ───────────────────────────────────────────────────────────
    const openMod = (mod) => {
        // Set selected to first request but modal will show all requests for this CIF
        setSelectedMod(mod);
        setModRemarks("");
        setModMsg("");
    };

    const submitModAction = async (action) => {
        if (action === "REJECT" && !modRemarks.trim())
            return setModMsg("Remarks required for rejection.");
        setModActing(action);
        setModMsg("");
        try {
            // Get all pending requests for this CIF
            const cifRequests = modList.filter(r => r.cif_id === selectedMod.cif_id);
            const errors = [];
            for (const req of cifRequests) {
                try {
                    await api("PUT", `/api/customers/modifications/${req.request_id}/review`, {
                        action, reviewedBy: getUser(), remarks: modRemarks,
                    });
                } catch (e) {
                    errors.push(req.section + ": " + e.message);
                }
            }
            if (errors.length > 0) {
                setModMsg("⚠ Some failed: " + errors.join(", "));
            } else {
                setModMsg(action === "APPROVE"
                    ? `✓ All ${cifRequests.length} modification(s) approved & applied!`
                    : `✓ All ${cifRequests.length} modification(s) rejected.`);
                setTimeout(() => {
                    setSelectedMod(null);
                    fetchAll();
                }, 1800);
            }
        } catch (e) {
            setModMsg("⚠ " + e.message);
        } finally {
            setModActing(null);
        }
    };

    const totalPending = cifList.length + modList.length + casaList.length;

    // ── CASA Actions ─────────────────────────────────────────────────────────
    const handleCasaAction = async (status) => {
        if (status === "REJECTED" && !casaRemarks.trim())
            return setCasaMsg("Remarks required for rejection.");
        setCasaActing(status);
        setCasaMsg("");
        try {
            await api("PUT", `/api/casa/${selectedCasa.account_id}/status`, {
                newStatus: status, changedBy: getUser(), remarks: casaRemarks,
            });
            setCasaMsg(status === "ACTIVE" ? "✓ Account approved!" : "✓ Account rejected.");
            setTimeout(() => {
                setSelectedCasa(null);
                setCasaRemarks("");
                fetchAll();
            }, 1500);
        } catch (e) {
            setCasaMsg("⚠ " + e.message);
        } finally {
            setCasaActing(null);
        }
    };

    return (
        <>
            <div className="pa-root">
                <TopBar breadcrumb={[{
                    label: "Approvals",
                    path: "/customers/manager/pending"
                }, {label: "Pending Approvals"}]}/>

                {/* NAV */}
                <nav className="pa-nav">
                    <button className="pa-back" onClick={() => navigate("/dashboard")}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Dashboard
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span className="pa-title">Pending Approvals</span>
                    {!cifLoading && !modLoading && (
                        <span className="pa-count">{totalPending} pending</span>
                    )}
                </nav>

                <div className="pa-body">
                    {error && (
                        <div style={{
                            padding: "8px 12px", background: "rgba(224,92,92,.1)",
                            border: "1px solid rgba(224,92,92,.3)", color: "#e05c5c",
                            borderRadius: 5, marginBottom: 14, fontSize: ".78rem"
                        }}>⚠ {error}</div>
                    )}

                    {/* TABS */}
                    <div style={{display: "flex", gap: 8, marginBottom: 16}}>
                        {[
                            {id: "cif", label: "CIF Approvals", icon: "🕐", count: cifList.length},
                            {id: "mod", label: "Modification Requests", icon: "🔄", count: modList.length},
                            {id: "casa", label: "CASA Approvals", icon: "🏦", count: casaList.length},
                        ].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    style={{
                                        padding: "8px 18px", borderRadius: 6, cursor: "pointer",
                                        fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", fontWeight: 600,
                                        border: activeTab === t.id ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.08)",
                                        background: activeTab === t.id ? "rgba(200,169,110,.1)" : "rgba(255,255,255,.03)",
                                        color: activeTab === t.id ? "#c8a96e" : "#6b7a99",
                                        display: "flex", alignItems: "center", gap: 8, transition: "all .2s",
                                    }}>
                                {t.icon} {t.label}
                                <span style={{
                                    padding: "1px 7px", borderRadius: 10, fontSize: ".68rem",
                                    background: activeTab === t.id ? "rgba(200,169,110,.2)" : "rgba(255,255,255,.06)",
                                    color: activeTab === t.id ? "#c8a96e" : "#6b7a99",
                                }}>{t.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── TAB 1: CIF APPROVALS ─────────────────────────────── */}
                    {activeTab === "cif" && (
                        <div className="pa-card">
                            <div className="pa-card-head">
                                <span>🕐</span>
                                <span className="pa-card-title">Customers Awaiting Approval</span>
                            </div>
                            {cifLoading ? (
                                <div className="pa-empty">
                                    <div className="pa-empty-icon">⏳</div>
                                    Loading...</div>
                            ) : cifList.length === 0 ? (
                                <div className="pa-empty">
                                    <div className="pa-empty-icon">✅</div>
                                    <div style={{fontWeight: 600, marginBottom: 4}}>All caught up!</div>
                                    <div style={{fontSize: ".78rem"}}>No pending CIF approvals.</div>
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        <th>CIF ID</th>
                                        <th>Customer Name</th>
                                        <th>Mobile</th>
                                        <th>PAN</th>
                                        <th>Stage</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Created By</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cifList.map((c) => {
                                        const s = STATUS_COLORS[c.cif_status] || STATUS_COLORS.UNDER_REVIEW;
                                        return (
                                            <tr key={c.cif_id} onClick={() => openCifDetail(c.cif_id)}>
                                                <td><span className="cif-id">{c.cif_id}</span></td>
                                                <td>{(c.first_name || "") + " " + (c.last_name || "")}</td>
                                                <td>{c.mobile_no || "—"}</td>
                                                <td style={{
                                                    fontFamily: "IBM Plex Mono,monospace",
                                                    fontSize: ".75rem"
                                                }}>{c.pan_no || "—"}</td>
                                                <td style={{
                                                    fontSize: ".75rem",
                                                    color: "#8a9bb5"
                                                }}>{c.onboarding_stage || "—"}</td>
                                                <td><span className="badge"
                                                          style={{color: s.color, background: s.bg}}>{s.label}</span>
                                                </td>
                                                <td style={{
                                                    fontSize: ".75rem",
                                                    color: "#8a9bb5"
                                                }}>{fmt(c.created_date)}</td>
                                                <td style={{
                                                    fontSize: ".75rem",
                                                    color: "#8a9bb5"
                                                }}>{c.created_by || "—"}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── TAB 2: MODIFICATION REQUESTS ─────────────────────── */}
                    {activeTab === "mod" && (
                        <div className="pa-card">
                            <div className="pa-card-head">
                                <span>🔄</span>
                                <span className="pa-card-title">Pending Modification Requests</span>
                            </div>
                            {modLoading ? (
                                <div className="pa-empty">
                                    <div className="pa-empty-icon">⏳</div>
                                    Loading...</div>
                            ) : modList.length === 0 ? (
                                <div className="pa-empty">
                                    <div className="pa-empty-icon">✅</div>
                                    <div style={{fontWeight: 600, marginBottom: 4}}>No pending modifications!</div>
                                    <div style={{fontSize: ".78rem"}}>All modification requests have been reviewed.
                                    </div>
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        <th>CIF ID</th>
                                        <th>Customer</th>
                                        <th>Sections Modified</th>
                                        <th>Requested By</th>
                                        <th>Requested At</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Group by CIF — one row per customer */}
                                    {Object.values(modList.reduce((acc, r) => {
                                        if (!acc[r.cif_id]) acc[r.cif_id] = {...r, sections: [], count: 0};
                                        acc[r.cif_id].sections.push(r.section);
                                        acc[r.cif_id].count++;
                                        return acc;
                                    }, {})).map((grp) => (
                                        <tr key={grp.cif_id} onClick={() => openMod(grp)}>
                                            <td><span className="cif-id">{grp.cif_id}</span></td>
                                            <td style={{fontWeight: 500}}>{(grp.first_name || "") + " " + (grp.last_name || "")}</td>
                                            <td>
                                                <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
                                                    {grp.sections.map(s => (
                                                        <span key={s} className="badge"
                                                              style={{
                                                                  color: "#c8a96e",
                                                                  background: "rgba(200,169,110,.1)"
                                                              }}>
                                                            {SECTION_ICON[s]} {s?.replace("_", " ")}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{
                                                fontSize: ".75rem",
                                                color: "#8a9bb5"
                                            }}>{grp.requested_by || "—"}</td>
                                            <td style={{
                                                fontSize: ".75rem",
                                                color: "#8a9bb5"
                                            }}>{fmt(grp.requested_at)}</td>
                                            <td>
                                                <button onClick={e => {
                                                    e.stopPropagation();
                                                    openMod(grp);
                                                }}
                                                        style={{
                                                            padding: "4px 12px",
                                                            borderRadius: 4,
                                                            border: "1px solid rgba(200,169,110,.3)",
                                                            background: "rgba(200,169,110,.08)",
                                                            color: "#c8a96e",
                                                            cursor: "pointer",
                                                            fontFamily: "inherit",
                                                            fontSize: ".72rem",
                                                            fontWeight: 600
                                                        }}>
                                                    Review All ({grp.count})
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                {/* ── CASA APPROVALS TAB ──────────────────────────────────────── */}
                {activeTab === "casa" && (
                    <div className="pa-card">
                        <div className="pa-card-head">
                            <span>🏦</span>
                            <span className="pa-card-title">CASA Account Approvals</span>
                        </div>
                        {casaLoading ? (
                            <div className="pa-empty">
                                <div className="pa-empty-icon">⏳</div>
                                Loading...</div>
                        ) : casaList.length === 0 ? (
                            <div className="pa-empty">
                                <div className="pa-empty-icon">✅</div>
                                <div style={{fontWeight: 600, marginBottom: 4}}>No pending CASA approvals</div>
                                <div style={{fontSize: ".78rem"}}>All account requests have been reviewed.</div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>Account Number</th>
                                    <th>CIF ID</th>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Branch</th>
                                    <th>Scheme</th>
                                    <th>Initial Deposit</th>
                                    <th>Created By</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {casaList.map((a) => (
                                    <tr key={a.account_id} onClick={() => {
                                        setSelectedCasa(a);
                                        setCasaRemarks("");
                                        setCasaMsg("");
                                    }}>
                                        <td><span className="cif-id">{a.account_number}</span></td>
                                        <td><span className="cif-id">{a.cif_id}</span></td>
                                        <td style={{fontWeight: 500}}>{(a.first_name || "") + " " + (a.last_name || "")}</td>
                                        <td><span className="badge" style={{
                                            color: "#c8a96e",
                                            background: "rgba(200,169,110,.1)"
                                        }}>{a.account_type}</span></td>
                                        <td style={{fontSize: ".75rem", color: "#8a9bb5"}}>{a.branch_name || "—"}</td>
                                        <td style={{fontSize: ".75rem", color: "#8a9bb5"}}>{a.scheme_name || "—"}</td>
                                        <td style={{fontWeight: 600}}>₹ {Number(a.initial_deposit || 0).toLocaleString("en-IN")}</td>
                                        <td style={{fontSize: ".75rem", color: "#8a9bb5"}}>{a.created_by || "—"}</td>
                                        <td>
                                            <button onClick={e => {
                                                e.stopPropagation();
                                                setSelectedCasa(a);
                                                setCasaRemarks("");
                                                setCasaMsg("");
                                            }}
                                                    style={{
                                                        padding: "4px 12px",
                                                        borderRadius: 4,
                                                        border: "1px solid rgba(200,169,110,.3)",
                                                        background: "rgba(200,169,110,.08)",
                                                        color: "#c8a96e",
                                                        cursor: "pointer",
                                                        fontFamily: "inherit",
                                                        fontSize: ".72rem",
                                                        fontWeight: 600
                                                    }}>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── CIF DETAIL MODAL ─────────────────────────────────────── */}
                {selectedCif && (
                    <div className="pa-overlay"
                         onClick={e => e.target.className === "pa-overlay" && setSelectedCif(null)}>
                        <div className="pa-modal">
                            <div className="pa-modal-head">
                                <span className="pa-modal-title">
                                    🪪 CIF: <span style={{fontFamily: "IBM Plex Mono,monospace"}}>{selectedCif}</span>
                                </span>
                                <button className="pa-close" onClick={() => setSelectedCif(null)}>✕</button>
                            </div>
                            <div className="pa-modal-body">
                                {cifDetailLoad ? (
                                    <div style={{textAlign: "center", padding: 32, color: "#6b7a99"}}>Loading
                                        details...</div>
                                ) : cifDetail ? (
                                    <>
                                        <div className="det-section">
                                            <div className="det-title">👤 Basic Info</div>
                                            <div className="det-grid">
                                                {[["Full Name", (cifDetail.first_name || "") + " " + (cifDetail.last_name || "")],
                                                    ["Mobile", cifDetail.mobile_no], ["Email", cifDetail.email],
                                                    ["PAN", cifDetail.pan_no], ["DOB", fmt(cifDetail.dob)],
                                                    ["Created By", cifDetail.created_by], ["Created", fmt(cifDetail.created_date)],
                                                    ["Status", cifDetail.cif_status],
                                                ].map(([k, v]) => (
                                                    <div key={k} className="det-row">
                                                        <span className="det-key">{k}</span>
                                                        <span className="det-val">{v || "—"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {cifDetail.addresses?.length > 0 && (
                                            <div className="det-section">
                                                <div className="det-title">🏠 Address</div>
                                                <div className="det-grid">
                                                    {[["Type", cifDetail.addresses[0].address_type],
                                                        ["Line 1", cifDetail.addresses[0].address_line1],
                                                        ["City", cifDetail.addresses[0].city],
                                                        ["State", cifDetail.addresses[0].state],
                                                        ["Pincode", cifDetail.addresses[0].postal_code],
                                                    ].map(([k, v]) => (
                                                        <div key={k} className="det-row">
                                                            <span className="det-key">{k}</span>
                                                            <span className="det-val">{v || "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {cifDetail.kyc?.length > 0 && (
                                            <div className="det-section">
                                                <div className="det-title">🪪 KYC</div>
                                                <div className="det-grid">
                                                    {[["Type", cifDetail.kyc[0].kyc_type],
                                                        ["PAN", cifDetail.kyc[0].pan_number],
                                                        ["Aadhaar", cifDetail.kyc[0].aadhaar_number],
                                                    ].map(([k, v]) => (
                                                        <div key={k} className="det-row">
                                                            <span className="det-key">{k}</span>
                                                            <span className="det-val">{v || "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {cifDetail.risk && (
                                            <div className="det-section">
                                                <div className="det-title">⚠️ Risk Profile</div>
                                                <div className="det-grid">
                                                    {[["Category", cifDetail.risk.risk_category],
                                                        ["Income", cifDetail.risk.income_range],
                                                        ["Occupation", cifDetail.risk.occupation],
                                                        ["PEP", cifDetail.risk.politically_exposed_person ? "Yes ⚠️" : "No"],
                                                    ].map(([k, v]) => (
                                                        <div key={k} className="det-row">
                                                            <span className="det-key">{k}</span>
                                                            <span className="det-val">{v || "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                            <div className="pa-action-panel">
                                <div className="pa-action-title">Manager Decision</div>
                                <div className="pa-action-btns">
                                    <button className={"pa-btn-approve" + (cifAction === "APPROVED" ? " active" : "")}
                                            onClick={() => setCifAction("APPROVED")}>✓ Approve
                                    </button>
                                    <button className={"pa-btn-reject" + (cifAction === "REJECTED" ? " active" : "")}
                                            onClick={() => setCifAction("REJECTED")}>✕ Reject
                                    </button>
                                </div>
                                {cifAction && (
                                    <>
                                        <textarea value={cifRemarks} onChange={e => setCifRemarks(e.target.value)}
                                                  placeholder={cifAction === "REJECTED" ? "Rejection reason (required)..." : "Approval remarks (optional)..."}/>
                                        <button
                                            className={"pa-submit " + (cifAction === "APPROVED" ? "approve" : "reject")}
                                            onClick={submitCifAction} disabled={cifSubmitting}>
                                            {cifSubmitting ? "Processing..." : cifAction === "APPROVED" ? "✓ Confirm Approval" : "✕ Confirm Rejection"}
                                        </button>
                                    </>
                                )}
                                {cifMsg &&
                                    <div className={"pa-msg" + (cifMsg.startsWith("⚠") ? " err" : "")}>{cifMsg}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODIFICATION REVIEW MODAL ─────────────────────────────── */}
                {selectedMod && (
                    <div className="pa-overlay"
                         onClick={e => e.target.className === "pa-overlay" && setSelectedMod(null)}>
                        <div className="pa-modal" style={{maxWidth: 780}}>
                            <div className="pa-modal-head">
                                <div>
                                    <span className="pa-modal-title">
                                        🔄 Modification Review — All Sections
                                    </span>
                                    <div style={{fontSize: ".72rem", color: "#6b7a99", marginTop: 3}}>
                                        {selectedMod.first_name} {selectedMod.last_name} ·{" "}
                                        <span style={{
                                            fontFamily: "IBM Plex Mono,monospace",
                                            color: "#c8a96e"
                                        }}>{selectedMod.cif_id}</span>
                                        {" "}· {modList.filter(r => r.cif_id === selectedMod.cif_id).length} section(s)
                                        pending
                                    </div>
                                </div>
                                <button className="pa-close" onClick={() => setSelectedMod(null)}>✕</button>
                            </div>
                            <div className="pa-modal-body">
                                {/* Show ALL sections for this CIF */}
                                {modList.filter(r => r.cif_id === selectedMod.cif_id).map(req => (
                                    <div key={req.request_id} style={{marginBottom: 16}}>
                                        <div style={{
                                            fontSize: ".72rem", fontWeight: 700, color: "#c8a96e",
                                            letterSpacing: ".06em", textTransform: "uppercase",
                                            marginBottom: 8, display: "flex", alignItems: "center", gap: 6
                                        }}>
                                            {SECTION_ICON[req.section]} {req.section?.replace("_", " ")}
                                            <span style={{
                                                color: "#6b7a99",
                                                fontWeight: 400,
                                                textTransform: "none",
                                                fontSize: ".65rem"
                                            }}>
                                                · by {req.requested_by} · {fmt(req.requested_at)}
                                            </span>
                                        </div>
                                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                                            <div style={{
                                                background: "rgba(224,92,92,.06)",
                                                border: "1px solid rgba(224,92,92,.15)",
                                                borderRadius: 7,
                                                padding: 12
                                            }}>
                                                <div style={{
                                                    fontSize: ".6rem",
                                                    fontWeight: 700,
                                                    color: "#e05c5c",
                                                    textTransform: "uppercase",
                                                    marginBottom: 8
                                                }}>🔴 Current
                                                </div>
                                                {Object.entries(parseJson(req.old_data)).map(([k, v]) => (
                                                    <div key={k} style={{marginBottom: 6}}>
                                                        <div style={{
                                                            fontSize: ".6rem",
                                                            color: "#6b7a99",
                                                            textTransform: "uppercase"
                                                        }}>{fmtKey(k)}</div>
                                                        <div style={{
                                                            fontSize: ".78rem",
                                                            color: "#e2e8f0"
                                                        }}>{String(v || "—")}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{
                                                background: "rgba(72,199,142,.06)",
                                                border: "1px solid rgba(72,199,142,.15)",
                                                borderRadius: 7,
                                                padding: 12
                                            }}>
                                                <div style={{
                                                    fontSize: ".6rem",
                                                    fontWeight: 700,
                                                    color: "#48c78e",
                                                    textTransform: "uppercase",
                                                    marginBottom: 8
                                                }}>🟢 Requested
                                                </div>
                                                {Object.entries(parseJson(req.new_data)).map(([k, v]) => {
                                                    const oldVal = parseJson(req.old_data)[k];
                                                    const changed = String(v) !== String(oldVal || "");
                                                    return (
                                                        <div key={k} style={{marginBottom: 6}}>
                                                            <div style={{
                                                                fontSize: ".6rem",
                                                                color: "#6b7a99",
                                                                textTransform: "uppercase"
                                                            }}>{fmtKey(k)}</div>
                                                            <div style={{
                                                                fontSize: ".78rem",
                                                                color: changed ? "#f59e0b" : "#e2e8f0",
                                                                fontWeight: changed ? 600 : 400
                                                            }}>
                                                                {String(v || "—")}{changed ? " ✏" : ""}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pa-action-panel">
                                <div className="pa-action-title">Manager Decision</div>
                                <textarea value={modRemarks} onChange={e => setModRemarks(e.target.value)}
                                          placeholder="Review remarks (required for rejection)..."/>
                                <div className="pa-action-btns" style={{marginTop: 10}}>
                                    <button className="pa-btn-reject" disabled={!!modActing}
                                            onClick={() => submitModAction("REJECT")}>
                                        {modActing === "REJECT" ? "Rejecting..." : "✕ Reject"}
                                    </button>
                                    <button className="pa-btn-approve" disabled={!!modActing}
                                            onClick={() => submitModAction("APPROVE")}>
                                        {modActing === "APPROVE" ? "Approving..." : "✓ Approve & Apply"}
                                    </button>
                                </div>
                                {modMsg &&
                                    <div className={"pa-msg" + (modMsg.startsWith("⚠") ? " err" : "")}>{modMsg}</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── CASA APPROVAL MODAL ──────────────────────────────────── */}
            {selectedCasa && (
                <div className="pa-overlay" onClick={e => e.target.className === "pa-overlay" && setSelectedCasa(null)}>
                    <div className="pa-modal">
                        <div className="pa-modal-head">
                            <div>
                                <span className="pa-modal-title">🏦 CASA Account Review</span>
                                <div style={{fontSize: ".72rem", color: "#6b7a99", marginTop: 3}}>
                                    {selectedCasa.account_number} · {selectedCasa.first_name} {selectedCasa.last_name} ·{" "}
                                    <span style={{
                                        fontFamily: "IBM Plex Mono,monospace",
                                        color: "#c8a96e"
                                    }}>{selectedCasa.cif_id}</span>
                                </div>
                            </div>
                            <button className="pa-close" onClick={() => setSelectedCasa(null)}>✕</button>
                        </div>
                        <div className="pa-modal-body">
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px",
                                padding: 14, background: "rgba(255,255,255,.02)", borderRadius: 8,
                                border: "1px solid rgba(255,255,255,.06)"
                            }}>
                                {[["Account Type", selectedCasa.account_type],
                                    ["Branch", selectedCasa.branch_name],
                                    ["Scheme", selectedCasa.scheme_name],
                                    ["Interest Rate", (selectedCasa.interest_rate || "0") + "%"],
                                    ["Initial Deposit", "₹ " + Number(selectedCasa.initial_deposit || 0).toLocaleString("en-IN")],
                                    ["Joint Account", selectedCasa.is_joint ? "Yes" : "No"],
                                    ["Mobile", selectedCasa.mobile_no],
                                    ["PAN", selectedCasa.pan_no],
                                    ["Created By", selectedCasa.created_by],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <div style={{
                                            fontSize: ".62rem",
                                            color: "#6b7a99",
                                            textTransform: "uppercase"
                                        }}>{k}</div>
                                        <div style={{fontSize: ".8rem", marginTop: 2}}>{v || "—"}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{marginTop: 14}}>
                                <label style={{
                                    fontSize: ".63rem", color: "#6b7a99", textTransform: "uppercase",
                                    letterSpacing: ".04em", display: "block", marginBottom: 6
                                }}>Remarks</label>
                                <textarea value={casaRemarks} onChange={e => setCasaRemarks(e.target.value)} rows={3}
                                          placeholder="Approval/rejection remarks..."
                                          style={{
                                              width: "100%", padding: "8px 12px", background: "#0e1117",
                                              border: "1px solid rgba(255,255,255,.1)", borderRadius: 5,
                                              color: "#e2e8f0", fontFamily: "IBM Plex Sans,sans-serif",
                                              fontSize: ".8rem", outline: "none", resize: "vertical"
                                          }}/>
                            </div>
                            {casaMsg && <div style={{
                                marginTop: 10, padding: "8px 12px", borderRadius: 5, fontSize: ".78rem",
                                background: casaMsg.startsWith("⚠") ? "rgba(224,92,92,.1)" : "rgba(72,199,142,.1)",
                                border: casaMsg.startsWith("⚠") ? "1px solid rgba(224,92,92,.3)" : "1px solid rgba(72,199,142,.3)",
                                color: casaMsg.startsWith("⚠") ? "#e05c5c" : "#48c78e"
                            }}>{casaMsg}</div>}
                        </div>
                        <div className="pa-action-panel">
                            <div className="pa-action-title">Manager Decision</div>
                            <div className="pa-action-btns">
                                <button className={"pa-btn-reject" + (casaActing === "REJECTED" ? " active" : "")}
                                        disabled={!!casaActing} onClick={() => handleCasaAction("REJECTED")}>
                                    {casaActing === "REJECTED" ? "Rejecting..." : "✕ Reject"}
                                </button>
                                <button className={"pa-btn-approve" + (casaActing === "ACTIVE" ? " active" : "")}
                                        disabled={!!casaActing} onClick={() => handleCasaAction("ACTIVE")}>
                                    {casaActing === "ACTIVE" ? "Approving..." : "✓ Approve"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}