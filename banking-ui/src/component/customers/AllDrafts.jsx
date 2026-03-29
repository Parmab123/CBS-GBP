import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import TopBar from "./Topbar";

const BASE = "http://localhost:8080";
const token = () => localStorage.getItem("accessToken");

const api = async (path) => {
    const res = await fetch(BASE + path, {
        headers: {Authorization: "Bearer " + token()},
    });
    if (!res.ok) throw new Error("Request failed: " + res.status);
    return res.json();
};

const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"})
    : "—";

const STAGE_COLOR = {
    DRAFT: "#6b7a99",
    BASIC_INFO: "#3b82f6",
    ADDRESS: "#8b5cf6",
    NOMINEE: "#06b6d4",
    INCOME: "#10b981",
    KYC: "#f59e0b",
    RISK: "#ef4444",
    FINAL_APPROVAL: "#48c78e",
    UNDER_REVIEW: "#c8a96e",
    PENDING_MODIFICATION: "#f59e0b",
    CHANGES_REQUESTED: "#a78bfa",
    COMPLETE: "#48c78e",
};

export default function AllDrafts() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await api("/api/customers");
                const drafts = (Array.isArray(data) ? data : [])
                    .filter(c => c.cif_status === "DRAFT");
                setList(drafts);
                setFiltered(drafts);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(list);
            return;
        }
        const q = search.toLowerCase();
        setFiltered(list.filter(c =>
            (c.cif_id || "").toLowerCase().includes(q) ||
            (c.first_name || "").toLowerCase().includes(q) ||
            (c.last_name || "").toLowerCase().includes(q) ||
            (c.mobile_no || "").toLowerCase().includes(q) ||
            (c.pan_no || "").toLowerCase().includes(q)
        ));
    }, [search, list]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ad-root { min-height: 100vh; background: #0e1117; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; }
        .ad-nav { display: flex; align-items: center; gap: 12px; padding: 0 24px; height: 52px;
          background: #111827; border-bottom: 1px solid rgba(255,255,255,.07); }
        .ad-back { background: none; border: none; color: #8a9bb5; cursor: pointer;
          font-size: .8rem; padding: 5px 8px; border-radius: 5px; font-family: inherit;
          display: flex; align-items: center; gap: 5px; transition: all .2s; }
        .ad-back:hover { background: rgba(255,255,255,.05); color: #e2e8f0; }
        .ad-back svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.5; }
        .ad-title { font-size: .95rem; font-weight: 600; }
        .ad-count { margin-left: auto; font-size: .75rem; color: #6b7a99;
          background: rgba(107,122,153,.1); border: 1px solid rgba(107,122,153,.2);
          padding: 3px 10px; border-radius: 4px; }
        .ad-body { padding: 20px 24px; }
        .ad-search-wrap { margin-bottom: 16px; position: relative; }
        .ad-search { width: 100%; max-width: 360px; padding: 8px 12px 8px 34px;
          background: #161b26; border: 1px solid rgba(255,255,255,.08); border-radius: 6px;
          color: #e2e8f0; font-family: inherit; font-size: .82rem; outline: none; }
        .ad-search:focus { border-color: rgba(200,169,110,.4); }
        .ad-search::placeholder { color: #4a5568; }
        .ad-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #6b7a99; font-size: .85rem; pointer-events: none; }
        .ad-card { background: #161b26; border: 1px solid rgba(255,255,255,.07); border-radius: 8px; overflow: hidden; }
        .ad-card-head { padding: 12px 16px; background: rgba(107,122,153,.04);
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 8px; }
        .ad-card-title { font-size: .85rem; font-weight: 600; color: #8a9bb5; }
        table { width: 100%; border-collapse: collapse; }
        thead th { padding: 10px 14px; text-align: left; font-size: .67rem; font-weight: 600;
          color: #6b7a99; letter-spacing: .06em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.02); }
        tbody tr { border-bottom: 1px solid rgba(255,255,255,.04); transition: background .15s; }
        tbody tr:hover { background: rgba(255,255,255,.03); }
        tbody tr:last-child { border-bottom: none; }
        tbody td { padding: 11px 14px; font-size: .8rem; }
        .cif-id { font-family: 'IBM Plex Mono', monospace; color: #c8a96e; font-size: .75rem; }
        .stage-badge { display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 3px; font-size: .68rem; font-weight: 600; }
        .stage-dot { width: 5px; height: 5px; border-radius: 50%; }
        .btn-continue { padding: 5px 12px; border-radius: 5px; border: 1px solid rgba(200,169,110,.3);
          background: rgba(200,169,110,.08); color: #c8a96e; cursor: pointer;
          font-family: inherit; font-size: .75rem; font-weight: 600; transition: all .2s; }
        .btn-continue:hover { background: rgba(200,169,110,.18); border-color: rgba(200,169,110,.5); }
        .ad-empty { padding: 48px; text-align: center; color: #6b7a99; }
        .ad-empty-icon { font-size: 2rem; margin-bottom: 10px; }
        .ad-error { padding: 8px 12px; background: rgba(224,92,92,.1);
          border: 1px solid rgba(224,92,92,.3); color: #e05c5c;
          border-radius: 5px; margin-bottom: 14px; font-size: .78rem; }
      `}</style>

            <div className="ad-root">
                <TopBar breadcrumb={[{label: "Customer Operations", path: "/customers"}, {label: "Draft CIFs"}]}/>
                <nav className="ad-nav">
                    <button className="ad-back" onClick={() => navigate("/dashboard")}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Dashboard
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span className="ad-title">📋 Draft CIFs</span>
                    {!loading && (
                        <span className="ad-count">{filtered.length} draft{filtered.length !== 1 ? "s" : ""}</span>
                    )}
                </nav>

                <div className="ad-body">
                    {error && <div className="ad-error">⚠ {error}</div>}

                    <div className="ad-search-wrap">
                        <span className="ad-search-icon">🔍</span>
                        <input className="ad-search"
                               placeholder="Search by name, CIF ID, PAN, mobile..."
                               value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>

                    <div className="ad-card">
                        <div className="ad-card-head">
                            <span>📝</span>
                            <span className="ad-card-title">Incomplete / Draft Customers</span>
                        </div>

                        {loading ? (
                            <div className="ad-empty">
                                <div className="ad-empty-icon">⏳</div>
                                Loading drafts...</div>
                        ) : filtered.length === 0 ? (
                            <div className="ad-empty">
                                <div className="ad-empty-icon">✅</div>
                                <div style={{fontWeight: 600, marginBottom: 4}}>No drafts found</div>
                                <div style={{fontSize: ".78rem"}}>
                                    {search ? "No results for your search." : "All customers have been submitted."}
                                </div>
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
                                    <th>Created</th>
                                    <th>Created By</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((c) => {
                                    const stage = c.onboarding_stage || "DRAFT";
                                    const color = STAGE_COLOR[stage] || "#6b7a99";
                                    return (
                                        <tr key={c.cif_id}>
                                            <td><span className="cif-id">{c.cif_id}</span></td>
                                            <td style={{fontWeight: 500}}>{(c.first_name || "") + " " + (c.last_name || "")}</td>
                                            <td>{c.mobile_no || "—"}</td>
                                            <td style={{
                                                fontFamily: "IBM Plex Mono, monospace",
                                                fontSize: ".75rem"
                                            }}>{c.pan_no || "—"}</td>
                                            <td>
                          <span className="stage-badge"
                                style={{color, background: color + "18", border: `1px solid ${color}33`}}>
                            <span className="stage-dot" style={{background: color}}/>
                              {stage}
                          </span>
                                            </td>
                                            <td style={{
                                                fontSize: ".75rem",
                                                color: "#8a9bb5"
                                            }}>{fmt(c.created_date)}</td>
                                            <td style={{
                                                fontSize: ".75rem",
                                                color: "#8a9bb5"
                                            }}>{c.created_by || "—"}</td>
                                            <td>
                                                <button className="btn-continue"
                                                        onClick={() => navigate(`/customers/create?cifId=${c.cif_id}`, {replace: true})}>
                                                    Continue →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}