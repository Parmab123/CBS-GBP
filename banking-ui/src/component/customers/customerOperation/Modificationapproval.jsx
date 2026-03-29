import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const BASE = "http://localhost:8080";
const tok = () => localStorage.getItem("accessToken");
const getUser = () => {
    try {
        return JSON.parse(atob(tok().split(".")[1])).sub || "";
    } catch {
        return "";
    }
};
const api = async (method, path, body) => {
    const res = await fetch(BASE + path, {
        method,
        headers: {"Content-Type": "application/json", Authorization: "Bearer " + tok()},
        body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
        data = await res.json();
    } catch {
        data = {};
    }
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
}) : "—";
const fmtKey = (k) => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const parseJson = (s) => {
    try {
        return JSON.parse(s);
    } catch {
        return {};
    }
};

const SECTION_ICON = {BASIC_INFO: "👤", ADDRESS: "🏠", NOMINEE: "👥", INCOME: "💰", KYC: "🪪", RISK: "⚠️"};

export default function ModificationApproval() {
    const navigate = useNavigate();
    const user = getUser();

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [acting, setActing] = useState(null); // "APPROVE" | "REJECT"
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const load = () => {
        setLoading(true);
        api("GET", "/api/customers/modifications/pending")
            .then(setList)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        load();
    }, []);

    const filtered = list.filter(r => {
        const q = search.toLowerCase();
        return !q ||
            (r.cif_id || "").toLowerCase().includes(q) ||
            (r.first_name || "").toLowerCase().includes(q) ||
            (r.last_name || "").toLowerCase().includes(q) ||
            (r.section || "").toLowerCase().includes(q);
    });

    const handleAction = async (action) => {
        if (action === "REJECT" && !remarks.trim()) {
            setError("Remarks required for rejection.");
            return;
        }
        setActing(action);
        setMsg("");
        setError("");
        try {
            await api("PUT", `/api/customers/modifications/${selected.request_id}/review`, {
                action,
                reviewedBy: user,
                remarks,
            });
            setMsg(`✓ Modification ${action === "APPROVE" ? "approved and applied" : "rejected"} successfully!`);
            setSelected(null);
            setRemarks("");
            setTimeout(() => {
                setMsg("");
                load();
            }, 1800);
        } catch (e) {
            setError(e.message);
        } finally {
            setActing(null);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0e1117; }
        .ma-root { min-height:100vh; background:#0e1117; color:#e2e8f0; font-family:'IBM Plex Sans',sans-serif; }
        .ma-nav { display:flex; align-items:center; gap:12px; padding:0 24px; height:52px; background:#111827; border-bottom:1px solid rgba(255,255,255,.07); position:sticky; top:0; z-index:10; }
        .ma-back { background:none; border:none; color:#8a9bb5; cursor:pointer; font-size:.8rem; padding:5px 8px; border-radius:5px; font-family:inherit; display:flex; align-items:center; gap:5px; }
        .ma-back:hover { background:rgba(255,255,255,.05); color:#e2e8f0; }
        .ma-back svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.5; }
        .ma-body { padding:20px 24px; }
        .ma-search { padding:7px 12px 7px 34px; background:#161b26; border:1px solid rgba(255,255,255,.08); border-radius:6px; color:#e2e8f0; font-family:inherit; font-size:.82rem; outline:none; width:100%; max-width:340px; }
        .ma-search:focus { border-color:rgba(200,169,110,.4); }
        .ma-card { background:#161b26; border:1px solid rgba(255,255,255,.07); border-radius:8px; overflow:hidden; margin-top:16px; }
        .ma-card-head { padding:12px 16px; background:rgba(107,122,153,.04); border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:8px; }
        table { width:100%; border-collapse:collapse; }
        thead th { padding:10px 14px; text-align:left; font-size:.65rem; font-weight:600; color:#6b7a99; letter-spacing:.06em; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); }
        tbody tr { border-bottom:1px solid rgba(255,255,255,.04); cursor:pointer; transition:background .15s; }
        tbody tr:hover { background:rgba(255,255,255,.03); }
        tbody tr:last-child { border-bottom:none; }
        tbody td { padding:11px 14px; font-size:.8rem; }
        .ma-cif { font-family:'IBM Plex Mono',monospace; color:#c8a96e; font-size:.75rem; }
        .ma-section-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:3px; font-size:.68rem; font-weight:600; background:rgba(200,169,110,.08); color:#c8a96e; border:1px solid rgba(200,169,110,.2); }

        /* MODAL */
        .ma-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
        .ma-modal { background:#161b26; border:1px solid rgba(200,169,110,.2); border-radius:10px; width:100%; max-width:820px; max-height:90vh; overflow-y:auto; }
        .ma-modal-head { padding:16px 20px; background:rgba(200,169,110,.05); border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:1; background:#161b26; }
        .ma-modal-title { font-size:.9rem; font-weight:700; color:#c8a96e; }
        .ma-modal-close { background:none; border:none; color:#6b7a99; cursor:pointer; font-size:1.1rem; }
        .ma-modal-body { padding:20px; }
        .ma-diff { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .ma-diff-col { border-radius:7px; padding:14px; }
        .ma-diff-col.old { background:rgba(224,92,92,.06); border:1px solid rgba(224,92,92,.15); }
        .ma-diff-col.new { background:rgba(72,199,142,.06); border:1px solid rgba(72,199,142,.15); }
        .ma-diff-title { font-size:.65rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; margin-bottom:10px; }
        .ma-diff-col.old .ma-diff-title { color:#e05c5c; }
        .ma-diff-col.new .ma-diff-title { color:#48c78e; }
        .ma-diff-row { display:flex; flex-direction:column; gap:2px; margin-bottom:8px; }
        .ma-diff-key { font-size:.62rem; color:#6b7a99; text-transform:uppercase; }
        .ma-diff-val { font-size:.8rem; color:#e2e8f0; }
        .ma-diff-val.changed { color:#f59e0b; font-weight:600; }
        .ma-remarks { width:100%; padding:8px 12px; background:#0e1117; border:1px solid rgba(255,255,255,.1); border-radius:5px; color:#e2e8f0; font-family:inherit; font-size:.8rem; outline:none; resize:vertical; }
        .ma-remarks:focus { border-color:rgba(200,169,110,.4); }
        .ma-modal-footer { padding:16px 20px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .ma-empty { padding:48px; text-align:center; color:#6b7a99; }
      `}</style>

            <div className="ma-root">
                {/* NAV */}
                <nav className="ma-nav">
                    <button className="ma-back" onClick={() => navigate("/dashboard")}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Dashboard
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span style={{fontWeight: 600}}>🔄 Modification Approvals</span>
                    {!loading && <span style={{
                        marginLeft: "auto",
                        fontSize: ".72rem",
                        color: "#6b7a99",
                        background: "rgba(107,122,153,.1)",
                        border: "1px solid rgba(107,122,153,.2)",
                        padding: "3px 10px",
                        borderRadius: 4
                    }}>{filtered.length} pending</span>}
                </nav>

                <div className="ma-body">
                    {/* SEARCH */}
                    <div style={{position: "relative"}}>
                        <span style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6b7a99"
                        }}>🔍</span>
                        <input className="ma-search" placeholder="Search by CIF, name, section..." value={search}
                               onChange={e => setSearch(e.target.value)}/>
                    </div>

                    {msg && <div style={{
                        padding: "8px 12px",
                        borderRadius: 5,
                        background: "rgba(72,199,142,.1)",
                        border: "1px solid rgba(72,199,142,.3)",
                        color: "#48c78e",
                        fontSize: ".78rem",
                        marginTop: 12
                    }}>{msg}</div>}
                    {error && <div style={{
                        padding: "8px 12px",
                        borderRadius: 5,
                        background: "rgba(224,92,92,.1)",
                        border: "1px solid rgba(224,92,92,.3)",
                        color: "#e05c5c",
                        fontSize: ".78rem",
                        marginTop: 12
                    }}>⚠ {error}</div>}

                    <div className="ma-card">
                        <div className="ma-card-head">
                            <span>🔄</span>
                            <span style={{fontSize: ".85rem", fontWeight: 600, color: "#8a9bb5"}}>Pending Modification Requests</span>
                        </div>

                        {loading ? (
                            <div className="ma-empty">
                                <div style={{fontSize: "1.5rem", marginBottom: 8}}>⏳</div>
                                Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div className="ma-empty">
                                <div style={{fontSize: "2rem", marginBottom: 8}}>✅</div>
                                <div style={{fontWeight: 600, marginBottom: 4}}>No pending modifications</div>
                                <div
                                    style={{fontSize: ".78rem"}}>{search ? "No results for your search." : "All modification requests have been reviewed."}</div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>CIF ID</th>
                                    <th>Customer Name</th>
                                    <th>Section</th>
                                    <th>Requested By</th>
                                    <th>Requested At</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map(r => (
                                    <tr key={r.request_id} onClick={() => {
                                        setSelected(r);
                                        setRemarks("");
                                        setError("");
                                    }}>
                                        <td><span className="ma-cif">{r.request_id}</span></td>
                                        <td><span className="ma-cif">{r.cif_id}</span></td>
                                        <td style={{fontWeight: 500}}>{(r.first_name || "") + " " + (r.last_name || "")}</td>
                                        <td><span
                                            className="ma-section-badge">{SECTION_ICON[r.section]} {r.section?.replace("_", " ")}</span>
                                        </td>
                                        <td style={{color: "#8a9bb5", fontSize: ".75rem"}}>{r.requested_by}</td>
                                        <td style={{color: "#8a9bb5", fontSize: ".75rem"}}>{fmt(r.requested_at)}</td>
                                        <td>
                                            <button onClick={e => {
                                                e.stopPropagation();
                                                setSelected(r);
                                                setRemarks("");
                                                setError("");
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
                </div>

                {/* REVIEW MODAL */}
                {selected && (
                    <div className="ma-overlay" onClick={() => setSelected(null)}>
                        <div className="ma-modal" onClick={e => e.stopPropagation()}>
                            <div className="ma-modal-head">
                                <div>
                                    <div
                                        className="ma-modal-title">{SECTION_ICON[selected.section]} {selected.section?.replace("_", " ")} —
                                        Modification Review
                                    </div>
                                    <div style={{fontSize: ".72rem", color: "#6b7a99", marginTop: 3}}>
                                        {selected.request_id} · {selected.first_name} {selected.last_name} · <span
                                        style={{
                                            fontFamily: "IBM Plex Mono,monospace",
                                            color: "#c8a96e"
                                        }}>{selected.cif_id}</span>
                                    </div>
                                </div>
                                <button className="ma-modal-close" onClick={() => setSelected(null)}>✕</button>
                            </div>

                            <div className="ma-modal-body">
                                {/* OLD vs NEW diff */}
                                <div className="ma-diff">
                                    {/* OLD */}
                                    <div className="ma-diff-col old">
                                        <div className="ma-diff-title">🔴 Current Data</div>
                                        {Object.entries(parseJson(selected.old_data)).map(([k, v]) => (
                                            <div key={k} className="ma-diff-row">
                                                <span className="ma-diff-key">{fmtKey(k)}</span>
                                                <span className="ma-diff-val">{String(v || "—")}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* NEW */}
                                    <div className="ma-diff-col new">
                                        <div className="ma-diff-title">🟢 Requested Changes</div>
                                        {Object.entries(parseJson(selected.new_data)).map(([k, v]) => {
                                            const oldVal = parseJson(selected.old_data)[k];
                                            const changed = String(v) !== String(oldVal || "");
                                            return (
                                                <div key={k} className="ma-diff-row">
                                                    <span className="ma-diff-key">{fmtKey(k)}</span>
                                                    <span
                                                        className={"ma-diff-val" + (changed ? " changed" : "")}>{String(v || "—")}{changed && " ✏"}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* META */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: "10px 20px",
                                    marginTop: 16,
                                    padding: 12,
                                    background: "rgba(255,255,255,.02)",
                                    borderRadius: 6,
                                    border: "1px solid rgba(255,255,255,.05)"
                                }}>
                                    {[["Requested By", selected.requested_by], ["Requested At", fmt(selected.requested_at)], ["Status", selected.status]].map(([k, v]) => (
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

                                {/* REMARKS */}
                                <div style={{marginTop: 16}}>
                                    <label style={{
                                        fontSize: ".65rem",
                                        color: "#6b7a99",
                                        textTransform: "uppercase",
                                        letterSpacing: ".04em",
                                        display: "block",
                                        marginBottom: 6
                                    }}>
                                        Remarks {acting === "REJECT" ? "*" : "(optional)"}
                                    </label>
                                    <textarea className="ma-remarks" rows={3} value={remarks}
                                              onChange={e => setRemarks(e.target.value)}
                                              placeholder="Enter review remarks..."/>
                                </div>

                                {error && <div style={{
                                    marginTop: 10,
                                    padding: "8px 12px",
                                    borderRadius: 5,
                                    background: "rgba(224,92,92,.1)",
                                    border: "1px solid rgba(224,92,92,.3)",
                                    color: "#e05c5c",
                                    fontSize: ".78rem"
                                }}>⚠ {error}</div>}
                            </div>

                            <div className="ma-modal-footer">
                                <button onClick={() => setSelected(null)}
                                        style={{
                                            padding: "8px 18px",
                                            borderRadius: 5,
                                            border: "1px solid rgba(255,255,255,.1)",
                                            background: "none",
                                            color: "#6b7a99",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            fontSize: ".8rem"
                                        }}>
                                    Cancel
                                </button>
                                <div style={{display: "flex", gap: 10}}>
                                    <button onClick={() => handleAction("REJECT")} disabled={!!acting}
                                            style={{
                                                padding: "8px 20px",
                                                borderRadius: 5,
                                                border: "1px solid rgba(224,92,92,.3)",
                                                background: "rgba(224,92,92,.1)",
                                                color: "#e05c5c",
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                fontSize: ".8rem",
                                                fontWeight: 600
                                            }}>
                                        {acting === "REJECT" ? "Rejecting..." : "✕ Reject"}
                                    </button>
                                    <button onClick={() => handleAction("APPROVE")} disabled={!!acting}
                                            style={{
                                                padding: "8px 24px",
                                                borderRadius: 5,
                                                border: "none",
                                                background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
                                                color: "#0a1628",
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                fontSize: ".8rem",
                                                fontWeight: 700
                                            }}>
                                        {acting === "APPROVE" ? "Approving..." : "✓ Approve & Apply"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}