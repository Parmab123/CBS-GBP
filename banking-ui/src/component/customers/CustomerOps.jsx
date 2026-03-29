import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Chatbot from "../../component/chatbot/Chatbot";
import TopBar from "./TopBar";
import "./CustomerOps.css";

const BASE = "http://localhost:8080";
const token = () => localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

// ── Hamburger menu options ────────────────────────────────────────────────────
const MENU_OPTIONS = [
    {id: "onboarding", label: "Customer Onboarding", icon: "➕", path: "/customers/create"},
    {id: "all", label: "All Customers", icon: "👥", path: "/customers/all"},
    {id: "pending", label: "Pending Review", icon: "🕐", path: "/customers/pending"},
    {id: "kyc", label: "KYC Operations", icon: "🪪", path: "/kyc"},
    {id: "followup", label: "Follow-Up", icon: "📋", path: "/followup"},
    {id: "signature", label: "Signature Management", icon: "✍️", path: "/signature"},
];

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS = {
    DRAFT: {color: "#8a9bb5", bg: "rgba(138,155,181,.12)", label: "Draft"},
    UNDER_REVIEW: {color: "#e0c94a", bg: "rgba(224,201,74,.12)", label: "Under Review"},
    APPROVED: {color: "#4caf88", bg: "rgba(76,175,136,.12)", label: "Approved"},
    REJECTED: {color: "#e05252", bg: "rgba(224,82,82,.12)", label: "Rejected"},
    CLOSED: {color: "#6b7a99", bg: "rgba(107,122,153,.12)", label: "Closed"},
    PENDING_MODIFICATION: {color: "#f59e0b", bg: "rgba(245,158,11,.12)", label: "Pending Modification"},
    CHANGES_REQUESTED: {color: "#a78bfa", bg: "rgba(167,139,250,.12)", label: "Changes Requested"},
};
const getStatus = (s) => STATUS[s?.toUpperCase()] || STATUS.DRAFT;

export default function CustomerOps() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState(null); // null = not searched yet
    const [error, setError] = useState(null);

    // Search form fields
    const [form, setForm] = useState({
        serviceMode: "In Person (Customer)",
        category: "Individual",
        customerName: "",
        customerRef: "",
        idType: "",
        idRef: "",
        depositNumber: "",
        accountRef: "",
        mobileNumber: "",
        email: "",
        debitCard: "",
        externalRef: "",
    });

    const set = (k, v) => setForm((f) => ({...f, [k]: v}));

    const handleSearch = async () => {
        setSearching(true);
        setError(null);
        setResults(null);
        try {
            const res = await fetch(BASE + "/api/customers", {
                headers: {Authorization: "Bearer " + token()},
            });
            if (!res.ok) throw new Error(res.status);
            let data = await res.json();
            if (!Array.isArray(data)) data = [];

            // Client-side filter based on form inputs
            const q = (v) => (v || "").toLowerCase();
            data = data.filter((c) => {
                const fullName = q(c.first_name) + " " + q(c.last_name);
                if (form.customerName && !fullName.includes(q(form.customerName))) return false;
                if (form.customerRef && !q(c.cif_id).includes(q(form.customerRef))) return false;
                if (form.mobileNumber && !(c.mobile_no || "").includes(form.mobileNumber)) return false;
                if (form.idRef && !q(c.pan_no).includes(q(form.idRef))) return false;
                return true;
            });
            setResults(data);
        } catch (e) {
            setError("Search failed. Please try again. (" + e.message + ")");
        } finally {
            setSearching(false);
        }
    };

    const handleReset = () => {
        setForm({
            serviceMode: "In Person (Customer)", category: "Individual",
            customerName: "", customerRef: "", idType: "", idRef: "",
            depositNumber: "", accountRef: "", mobileNumber: "", email: "",
            debitCard: "", externalRef: "",
        });
        setResults(null);
        setError(null);
    };

    const inputStyle = {
        width: "100%", padding: "4px 8px",
        background: "#0e1117", border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 5, color: "#e2e8f0",
        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: ".75rem",
        outline: "none", transition: "border-color .2s",
    };
    const labelStyle = {
        fontSize: ".66rem", color: "#8a9bb5",
        marginBottom: 2, display: "block",
    };
    const selectStyle = {
        ...inputStyle,
        appearance: "none", cursor: "pointer",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a99' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
        paddingRight: 30,
    };

    return (
        <>

            <div className="co-root">
                <TopBar breadcrumb={[{label: "Customer Operations", path: "/customers"}, {label: "Customer Search"}]}/>

                {/* SLIDE MENU OVERLAY */}
                {menuOpen && (
                    <>
                        <div className="co-overlay" onClick={() => setMenuOpen(false)}/>
                        <div className="co-menu">
                            <div className="co-menu-head">
                                <div className="co-menu-logo">CBS</div>
                                <button className="co-menu-close" onClick={() => setMenuOpen(false)}>
                                    <svg viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="co-menu-section">Customer Operations</div>
                            {MENU_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    className="co-menu-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate(opt.path);
                                    }}
                                >
                                    <span className="icon">{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}

                            <div className="co-menu-section" style={{marginTop: 8}}>Navigation</div>
                            <button className="co-menu-item" onClick={() => {
                                setMenuOpen(false);
                                navigate("/dashboard");
                            }}>
                                <span className="icon">🏠</span>
                                Dashboard
                            </button>
                        </div>
                    </>
                )}

                {/* NAV */}
                <nav className="co-nav">
                    <button className="co-back" onClick={() => navigate("/dashboard")}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Dashboard
                    </button>
                    <div>
                        <span className="co-nav-title">Customer Ops</span>
                    </div>
                    <button className="co-hamburger" onClick={() => setMenuOpen(true)} style={{marginLeft: "auto"}}>
                        <span/><span/><span/>
                    </button>
                </nav>

                {/* BREADCRUMB */}
                <div className="co-breadcrumb">
                    <span>Home</span>
                    <span className="sep">›</span>
                    <span>Internal Operations</span>
                    <span className="sep">›</span>
                    <span className="cur">Customer Search</span>
                </div>

                {/* SEARCH CARD */}
                <div className="co-card">
                    <div className="co-card-head">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        Customer Search
                    </div>
                    <div className="co-card-body">

                        {/* Row 1 — Service Mode & Category */}
                        <div className="co-form-grid">
                            <div className="co-form-group">
                                <label style={labelStyle}>Service Mode <span style={{color: "#e05252"}}>*</span></label>
                                <select style={selectStyle} value={form.serviceMode}
                                        onChange={(e) => set("serviceMode", e.target.value)}>
                                    <option>In Person (Customer)</option>
                                    <option>Online</option>
                                    <option>Phone Banking</option>
                                </select>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>Category <span style={{color: "#e05252"}}>*</span></label>
                                <select style={selectStyle} value={form.category}
                                        onChange={(e) => set("category", e.target.value)}>
                                    <option>Individual</option>
                                    <option>Corporate</option>
                                    <option>SME</option>
                                </select>
                            </div>
                        </div>

                        <div className="co-divider"/>

                        {/* Row 2 */}
                        <div className="co-form-grid">
                            <div className="co-form-group">
                                <label style={labelStyle}>Customer Name</label>
                                <input style={inputStyle} placeholder="Enter customer name" value={form.customerName}
                                       onChange={(e) => set("customerName", e.target.value)}/>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>Customer Reference</label>
                                <input style={inputStyle} placeholder="CIF ID or reference" value={form.customerRef}
                                       onChange={(e) => set("customerRef", e.target.value)}/>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="co-form-row">
                            <div className="co-form-group">
                                <label style={labelStyle}>Identification Type</label>
                                <select style={selectStyle} value={form.idType}
                                        onChange={(e) => set("idType", e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Aadhaar</option>
                                    <option>PAN</option>
                                    <option>Passport</option>
                                    <option>Voter ID</option>
                                    <option>Driving License</option>
                                </select>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>Identification Reference</label>
                                <input style={inputStyle} placeholder="ID number" value={form.idRef}
                                       onChange={(e) => set("idRef", e.target.value)}/>
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="co-form-row">
                            <div className="co-form-group">
                                <label style={labelStyle}>Deposit Number</label>
                                <input style={inputStyle} placeholder="Deposit number" value={form.depositNumber}
                                       onChange={(e) => set("depositNumber", e.target.value)}/>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>Account Reference</label>
                                <input style={inputStyle} placeholder="Account number" value={form.accountRef}
                                       onChange={(e) => set("accountRef", e.target.value)}/>
                            </div>
                        </div>

                        {/* Row 5 */}
                        <div className="co-form-row">
                            <div className="co-form-group">
                                <label style={labelStyle}>Primary Mobile Number</label>
                                <input style={inputStyle} placeholder="Mobile number" value={form.mobileNumber}
                                       onChange={(e) => set("mobileNumber", e.target.value)}/>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>E-Mail</label>
                                <input style={inputStyle} type="email" placeholder="Email address" value={form.email}
                                       onChange={(e) => set("email", e.target.value)}/>
                            </div>
                        </div>

                        {/* Row 6 */}
                        <div className="co-form-row">
                            <div className="co-form-group">
                                <label style={labelStyle}>Debit Card Number</label>
                                <input style={inputStyle} placeholder="Debit card number" value={form.debitCard}
                                       onChange={(e) => set("debitCard", e.target.value)}/>
                            </div>
                            <div className="co-form-group">
                                <label style={labelStyle}>External Customer Reference</label>
                                <input style={inputStyle} placeholder="External reference" value={form.externalRef}
                                       onChange={(e) => set("externalRef", e.target.value)}/>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="co-actions">
                            <button className="co-btn-reset" onClick={handleReset}>Reset</button>
                            <button
                                className="co-btn-search"
                                onClick={handleSearch}
                                disabled={searching}
                            >
                                {searching ? <div className="co-spin"/> : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a1628"
                                         strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8"/>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                )}
                                {searching ? "Searching..." : "Search"}
                            </button>
                        </div>

                    </div>
                </div>

                {/* ERROR */}
                {error && <div className="co-error">⚠️ {error}</div>}

                {/* RESULTS */}
                {results !== null && (
                    <div className="co-results">
                        <div className="co-results-head">
                            <div className="co-results-title">Search Results</div>
                            <div className="co-results-count">{results.length} found</div>
                        </div>

                        {results.length === 0 ? (
                            <div className="co-state">
                                <div className="co-state-icon">🔍</div>
                                <div>No customers found matching your criteria.</div>
                            </div>
                        ) : (
                            <div className="co-table-wrap">
                                <table className="co-table">
                                    <thead>
                                    <tr>
                                        <th>CIF ID</th>
                                        <th>Customer Name</th>
                                        <th>Mobile</th>
                                        <th>PAN No</th>
                                        <th>Onboarding Stage</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {results.map((c) => {
                                        const cifId = c.cif_id;
                                        const s = getStatus(c.cif_status);
                                        return (
                                            <tr key={cifId} onClick={() => navigate("/customers/" + cifId)}>
                                                <td><span className="co-cif">{cifId}</span></td>
                                                <td><span
                                                    className="co-name-cell">{(c.first_name || "") + " " + (c.last_name || "")}</span>
                                                </td>
                                                <td>{c.mobile_no || "—"}</td>
                                                <td>{c.pan_no || "—"}</td>
                                                <td>{c.onboarding_stage || "—"}</td>
                                                <td>
                            <span className="co-badge" style={{color: s.color, background: s.bg}}>
                              {s.label}
                            </span>
                                                </td>
                                                <td>
                                                    {c.created_date
                                                        ? new Date(c.created_date).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        })
                                                        : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>

            <Chatbot/>
        </>
    );
}