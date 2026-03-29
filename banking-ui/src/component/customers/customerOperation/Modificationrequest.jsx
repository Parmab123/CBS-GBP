import {useEffect, useState} from "react";
import TopBar from "../TopBar";
import {useNavigate, useParams} from "react-router-dom";

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

const SECTIONS = [
    {id: "BASIC_INFO", label: "Basic Info", icon: "👤"},
    {id: "ADDRESS", label: "Address", icon: "🏠"},
    {id: "NOMINEE", label: "Nominee", icon: "👥"},
    {id: "INCOME", label: "Income", icon: "💰"},
    {id: "KYC", label: "KYC", icon: "🪪"},
    {id: "RISK", label: "Risk Profile", icon: "⚠️"},
    {id: "REVIEW", label: "Review & Submit", icon: "✅"},
];

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Other"];

const INPUT = {
    width: "100%", padding: "8px 12px", background: "#0e1117",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "#e2e8f0",
    fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", outline: "none"
};
const SELECT = {...INPUT, cursor: "pointer"};
const LABEL = {
    fontSize: ".63rem",
    color: "#6b7a99",
    textTransform: "uppercase",
    letterSpacing: ".04em",
    display: "block",
    marginBottom: 4
};
const GRID2 = {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px"};
const GRID3 = {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px"};
const SEC = {
    fontSize: ".63rem", fontWeight: 700, color: "#c8a96e", letterSpacing: ".08em",
    textTransform: "uppercase", borderBottom: "1px solid rgba(200,169,110,.12)",
    paddingBottom: 6, margin: "18px 0 12px"
};

export default function ModificationRequest() {
    const {cifId} = useParams();
    const navigate = useNavigate();
    const user = getUser();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("BASIC_INFO");
    const [saved, setSaved] = useState({});     // which sections are saved
    const [saving, setSaving] = useState(null);   // currently saving section
    const [sectionMsg, setSectionMsg] = useState({});     // per-section msg
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");
    const [error, setError] = useState("");

    const [forms, setForms] = useState({
        BASIC_INFO: {firstName: "", lastName: "", mobileNo: "", email: ""},
        ADDRESS: {
            addressType: "PERMANENT",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India"
        },
        NOMINEE: {
            nomineeName: "",
            dob: "",
            relation: "",
            phone: "",
            email: "",
            panNumber: "",
            aadhaarNumber: "",
            addressLine1: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India"
        },
        INCOME: {
            incomeSource: "",
            annualIncome: "",
            employerName: "",
            employerAddress: "",
            employerCity: "",
            employerState: "",
            employerPincode: "",
            itrFiled: "false",
            itrYear: "",
            itrAmount: "",
            bankAccountNumber: "",
            bankName: "",
            bankIfsc: "",
            bankBranch: ""
        },
        KYC: {kycType: "PAN", panNumber: "", aadhaarNumber: ""},
        RISK: {incomeRange: "", occupation: "", riskCategory: "LOW", politicallyExposedPerson: "false"},
    });

    const [originals, setOriginals] = useState({});

    useEffect(() => {
        api("GET", `/api/customers/${cifId}`)
            .then(data => {
                setDetail(data);
                const f = {
                    BASIC_INFO: {
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        mobileNo: data.mobile_no || "",
                        email: data.email || ""
                    },
                    ADDRESS: {
                        addressType: data.addresses?.[0]?.address_type || "PERMANENT",
                        addressLine1: data.addresses?.[0]?.address_line1 || "",
                        addressLine2: data.addresses?.[0]?.address_line2 || "",
                        city: data.addresses?.[0]?.city || "",
                        state: data.addresses?.[0]?.state || "",
                        postalCode: data.addresses?.[0]?.postal_code || "",
                        country: data.addresses?.[0]?.country || "India"
                    },
                    NOMINEE: {
                        nomineeName: data.nominees?.[0]?.nominee_name || "",
                        dob: data.nominees?.[0]?.dob || "",
                        relation: data.nominees?.[0]?.relation || "",
                        phone: data.nominees?.[0]?.phone || "",
                        email: data.nominees?.[0]?.email || "",
                        panNumber: data.nominees?.[0]?.pan_number || "",
                        aadhaarNumber: data.nominees?.[0]?.aadhaar_number || "",
                        addressLine1: data.nominees?.[0]?.address_line1 || "",
                        city: data.nominees?.[0]?.city || "",
                        state: data.nominees?.[0]?.state || "",
                        postalCode: data.nominees?.[0]?.postal_code || "",
                        country: data.nominees?.[0]?.country || "India"
                    },
                    INCOME: {
                        incomeSource: data.income?.income_source || "",
                        annualIncome: String(data.income?.annual_income || ""),
                        employerName: data.income?.employer_name || "",
                        employerAddress: data.income?.employer_address || "",
                        employerCity: data.income?.employer_city || "",
                        employerState: data.income?.employer_state || "",
                        employerPincode: data.income?.employer_pincode || "",
                        itrFiled: data.income?.itr_filed ? "true" : "false",
                        itrYear: data.income?.itr_year || "",
                        itrAmount: String(data.income?.itr_amount || ""),
                        bankAccountNumber: data.income?.bank_account_number || "",
                        bankName: data.income?.bank_name || "",
                        bankIfsc: data.income?.bank_ifsc || "",
                        bankBranch: data.income?.bank_branch || ""
                    },
                    KYC: {
                        kycType: data.kyc?.[0]?.kyc_type || "PAN",
                        panNumber: data.kyc?.[0]?.pan_number || "",
                        aadhaarNumber: data.kyc?.[0]?.aadhaar_number || ""
                    },
                    RISK: {
                        incomeRange: data.risk?.income_range || "",
                        occupation: data.risk?.occupation || "",
                        riskCategory: data.risk?.risk_category || "LOW",
                        politicallyExposedPerson: data.risk?.politically_exposed_person ? "true" : "false"
                    },
                };
                setForms(f);
                setOriginals(JSON.parse(JSON.stringify(f))); // deep copy as originals
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [cifId]);

    const upd = (section, key) => (e) => {
        setForms(p => ({...p, [section]: {...p[section], [key]: e.target.value}}));
        // clear saved state when editing again
        setSaved(p => ({...p, [section]: false}));
    };

    const saveSection = (section) => {
        // Just save locally — API call happens only on final Submit
        setSaved(p => ({...p, [section]: true}));
        setSectionMsg(p => ({
            ...p,
            [section]: "✓ Changes saved locally. Submit from Review tab to send for approval."
        }));
    };

    const submitAll = async () => {
        const savedSections = Object.keys(saved).filter(s => saved[s]);
        if (savedSections.length === 0) {
            setSubmitMsg("⚠ Please save at least one section first.");
            return;
        }
        setSubmitting(true);
        setSubmitMsg("");
        const errors = [];
        for (const section of savedSections) {
            try {
                await api("POST", `/api/customers/${cifId}/modifications`, {
                    section,
                    oldData: JSON.stringify(originals[section]),
                    newData: JSON.stringify(forms[section]),
                    requestedBy: user,
                });
            } catch (e) {
                errors.push(`${section}: ${e.message}`);
            }
        }
        setSubmitting(false);
        if (errors.length > 0) {
            setSubmitMsg("⚠ Some failed: " + errors.join(", "));
        } else {
            setSubmitMsg(`✓ ${savedSections.length} modification request(s) submitted for manager approval!`);
            setTimeout(() => navigate(`/customers/${cifId}`), 2000);
        }
    };

    // ── Field helpers ─────────────────────────────────────────────────────────
    const inp = (section, key, label, type = "text", placeholder = "") => (
        <div style={{display: "flex", flexDirection: "column"}}>
            <label style={LABEL}>{label}</label>
            <input type={type} style={INPUT} placeholder={placeholder}
                   value={forms[section]?.[key] ?? ""}
                   onChange={upd(section, key)}/>
        </div>
    );
    const sel = (section, key, label, options) => (
        <div style={{display: "flex", flexDirection: "column"}}>
            <label style={LABEL}>{label}</label>
            <select style={SELECT} value={forms[section]?.[key] ?? ""} onChange={upd(section, key)}>
                <option value="">Select</option>
                {options.map(o => typeof o === "object"
                    ? <option key={o.v} value={o.v}>{o.l}</option>
                    : <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    const SaveBar = ({section}) => (
        <div style={{
            marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
            <div>
                {sectionMsg[section] && (
                    <span style={{
                        fontSize: ".78rem",
                        color: sectionMsg[section].startsWith("⚠") ? "#e05c5c" : "#48c78e"
                    }}>
            {sectionMsg[section]}
          </span>
                )}
            </div>
            <button onClick={() => saveSection(section)} disabled={saving === section}
                    style={{
                        padding: "8px 24px", borderRadius: 5, border: "none", cursor: "pointer",
                        fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", fontWeight: 700,
                        background: saved[section] ? "rgba(72,199,142,.2)" : "linear-gradient(135deg,#c8a96e,#a07840)",
                        color: saved[section] ? "#48c78e" : "#0a1628",
                        border: saved[section] ? "1px solid rgba(72,199,142,.4)" : "none"
                    }}>
                {saving === section ? "Saving..." : saved[section] ? "✓ Marked for Submit" : "Save Changes"}
            </button>
        </div>
    );

    // ── Review summary ────────────────────────────────────────────────────────
    const ReviewRow = ({label, val}) => (
        <div style={{
            display: "flex", justifyContent: "space-between", padding: "5px 0",
            borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: ".8rem"
        }}>
            <span style={{color: "#6b7a99", minWidth: 160}}>{label}</span>
            <span style={{color: "#e2e8f0", textAlign: "right"}}>{val || "—"}</span>
        </div>
    );
    const ReviewSection = ({title, icon, fields}) => (
        <div style={{
            marginBottom: 16, background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden"
        }}>
            <div style={{
                padding: "10px 14px", background: "rgba(200,169,110,.04)",
                borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: ".78rem", fontWeight: 700, color: "#c8a96e"
            }}>
                {icon} {title}
                {saved[title.toUpperCase().replace(" ", "_")] &&
                    <span style={{marginLeft: 8, fontSize: ".65rem", color: "#48c78e"}}>✓ Modified</span>}
            </div>
            <div style={{padding: "10px 14px"}}>{fields.map(([l, v]) => <ReviewRow key={l} label={l} val={v}/>)}</div>
        </div>
    );

    if (loading) return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#0e1117",
            color: "#6b7a99",
            fontFamily: "IBM Plex Sans,sans-serif",
            flexDirection: "column",
            gap: 12
        }}>
            <div style={{fontSize: "1.5rem"}}>⏳</div>
            Loading...
        </div>
    );

    const savedCount = Object.values(saved).filter(Boolean).length;
    const f = forms[activeTab] || {};

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0e1117; }
        .mr-root { min-height:100vh; background:#0e1117; color:#e2e8f0; font-family:'IBM Plex Sans',sans-serif; }
        .mr-nav { display:flex; align-items:center; gap:12px; padding:0 24px; height:52px;
          background:#111827; border-bottom:1px solid rgba(255,255,255,.07); position:sticky; top:0; z-index:10; }
        .mr-back { background:none; border:none; color:#8a9bb5; cursor:pointer; font-size:.8rem;
          padding:5px 8px; border-radius:5px; font-family:inherit; display:flex; align-items:center; gap:5px; }
        .mr-back:hover { background:rgba(255,255,255,.05); color:#e2e8f0; }
        .mr-back svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.5; }
        .mr-body { display:grid; grid-template-columns:220px 1fr; gap:16px; padding:20px 24px; }
        .mr-sidebar { display:flex; flex-direction:column; gap:6px; }
        .mr-tab { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:7px;
          cursor:pointer; border:1px solid transparent; font-size:.82rem; font-weight:500;
          background:none; color:#8a9bb5; font-family:inherit; transition:all .2s; position:relative; text-align:left; }
        .mr-tab:hover { background:rgba(255,255,255,.04); }
        .mr-tab.active { background:rgba(200,169,110,.08); border-color:rgba(200,169,110,.25); color:#c8a96e; }
        .mr-tab.review-tab { border-color:rgba(72,199,142,.2); color:#48c78e; }
        .mr-tab.review-tab.active { background:rgba(72,199,142,.08); border-color:rgba(72,199,142,.4); }
        .mr-tab.saved-tab::after { content:'✓'; position:absolute; right:10px; color:#48c78e; font-size:.72rem; font-weight:700; }
        .mr-panel { background:#161b26; border:1px solid rgba(255,255,255,.07); border-radius:10px; overflow:hidden; }
        .mr-panel-head { padding:14px 18px; background:rgba(200,169,110,.04);
          border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:10px; }
        .mr-panel-title { font-size:.9rem; font-weight:700; color:#c8a96e; }
        .mr-panel-body { padding:20px; }
        input:focus, select:focus { border-color:rgba(200,169,110,.5) !important; outline:none; }
      `}</style>

            <div className="mr-root">
                <TopBar
                    breadcrumb={[{label: "Customer Operations", path: "/customers"}, {label: "Modification Request"}]}/>
                <nav className="mr-nav">
                    <button className="mr-back" onClick={() => navigate(`/customers/${cifId}`)}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Back
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span style={{
                        fontFamily: "IBM Plex Mono,monospace",
                        color: "#c8a96e",
                        fontSize: ".85rem",
                        fontWeight: 600
                    }}>{cifId}</span>
                    <span style={{color: "#6b7a99", fontSize: ".8rem"}}>— Modification Request</span>
                    {savedCount > 0 && (
                        <span style={{
                            marginLeft: "auto",
                            padding: "3px 10px",
                            borderRadius: 4,
                            fontSize: ".72rem",
                            fontWeight: 600,
                            background: "rgba(72,199,142,.1)",
                            border: "1px solid rgba(72,199,142,.3)",
                            color: "#48c78e"
                        }}>
              ✓ {savedCount} section{savedCount > 1 ? "s" : ""} saved
            </span>
                    )}
                </nav>

                <div className="mr-body">
                    {/* SIDEBAR */}
                    <div className="mr-sidebar">
                        <div style={{
                            fontSize: ".65rem", color: "#6b7a99", fontWeight: 700, letterSpacing: ".08em",
                            textTransform: "uppercase", marginBottom: 4, paddingLeft: 4
                        }}>Sections
                        </div>
                        {SECTIONS.map(s => (
                            <button key={s.id}
                                    className={"mr-tab"
                                        + (activeTab === s.id ? " active" : "")
                                        + (saved[s.id] ? " saved-tab" : "")
                                        + (s.id === "REVIEW" ? " review-tab" : "")}>
                <span onClick={() => setActiveTab(s.id)}
                      style={{display: "flex", alignItems: "center", gap: 10, flex: 1}}>
                  <span>{s.icon}</span><span>{s.label}</span>
                </span>
                            </button>
                        ))}

                        {/* Customer card */}
                        <div style={{
                            marginTop: 16, padding: 12, background: "rgba(255,255,255,.02)",
                            border: "1px solid rgba(255,255,255,.06)", borderRadius: 7
                        }}>
                            <div style={{
                                fontSize: ".63rem",
                                color: "#6b7a99",
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                                marginBottom: 6
                            }}>Customer
                            </div>
                            <div style={{
                                fontWeight: 600,
                                fontSize: ".82rem"
                            }}>{detail?.first_name} {detail?.last_name}</div>
                            <div style={{
                                fontSize: ".72rem",
                                color: "#8a9bb5",
                                marginTop: 3,
                                fontFamily: "IBM Plex Mono,monospace"
                            }}>{cifId}</div>
                            <div style={{
                                marginTop: 4,
                                fontSize: ".68rem",
                                color: "#8a9bb5"
                            }}>Stage: {detail?.onboarding_stage || "—"}</div>
                            <div style={{
                                marginTop: 6,
                                display: "inline-flex",
                                padding: "2px 8px",
                                borderRadius: 3,
                                fontSize: ".67rem",
                                fontWeight: 600,
                                background: "rgba(245,158,11,.1)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,.3)"
                            }}>
                                {detail?.cif_status}
                            </div>
                        </div>
                    </div>

                    {/* MAIN PANEL */}
                    <div className="mr-panel">
                        <div className="mr-panel-head">
                            <span>{SECTIONS.find(s => s.id === activeTab)?.icon}</span>
                            <span className="mr-panel-title">{SECTIONS.find(s => s.id === activeTab)?.label}</span>
                            {saved[activeTab] && activeTab !== "REVIEW" &&
                                <span style={{marginLeft: "auto", fontSize: ".72rem", color: "#48c78e"}}>✓ Saved</span>}
                        </div>

                        <div className="mr-panel-body">

                            {/* BASIC INFO */}
                            {activeTab === "BASIC_INFO" && <>
                                <div style={GRID2}>
                                    {inp("BASIC_INFO", "firstName", "First Name")}
                                    {inp("BASIC_INFO", "lastName", "Last Name")}
                                    {inp("BASIC_INFO", "mobileNo", "Mobile Number", "tel")}
                                    {inp("BASIC_INFO", "email", "Email", "email")}
                                </div>
                                <SaveBar section="BASIC_INFO"/>
                            </>}

                            {/* ADDRESS */}
                            {activeTab === "ADDRESS" && <>
                                <div style={GRID2}>
                                    {sel("ADDRESS", "addressType", "Address Type", ["PERMANENT", "CORRESPONDENCE", "OFFICE"])}
                                    {inp("ADDRESS", "addressLine1", "Address Line 1")}
                                    {inp("ADDRESS", "addressLine2", "Address Line 2")}
                                    {inp("ADDRESS", "city", "City")}
                                    {sel("ADDRESS", "state", "State", STATES)}
                                    {inp("ADDRESS", "postalCode", "Postal Code")}
                                    {inp("ADDRESS", "country", "Country")}
                                </div>
                                <SaveBar section="ADDRESS"/>
                            </>}

                            {/* NOMINEE */}
                            {activeTab === "NOMINEE" && <>
                                <div style={SEC}>Personal Details</div>
                                <div style={GRID3}>
                                    {inp("NOMINEE", "nomineeName", "Nominee Name")}
                                    {inp("NOMINEE", "dob", "Date of Birth", "date")}
                                    {sel("NOMINEE", "relation", "Relation", ["Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Grand Father", "Grand Mother", "Other"])}
                                    {inp("NOMINEE", "phone", "Phone")}
                                    {inp("NOMINEE", "email", "Email", "email")}
                                </div>
                                <div style={SEC}>ID Proof</div>
                                <div style={GRID2}>
                                    {inp("NOMINEE", "panNumber", "PAN Number")}
                                    {inp("NOMINEE", "aadhaarNumber", "Aadhaar Number")}
                                </div>
                                <div style={SEC}>Address</div>
                                <div style={GRID2}>
                                    {inp("NOMINEE", "addressLine1", "Address Line 1")}
                                    {inp("NOMINEE", "city", "City")}
                                    {sel("NOMINEE", "state", "State", STATES)}
                                    {inp("NOMINEE", "postalCode", "Postal Code")}
                                    {inp("NOMINEE", "country", "Country")}
                                </div>
                                <SaveBar section="NOMINEE"/>
                            </>}

                            {/* INCOME */}
                            {activeTab === "INCOME" && <>
                                <div style={SEC}>Income Details</div>
                                <div style={GRID3}>
                                    {sel("INCOME", "incomeSource", "Income Source", ["Salary", "Business", "Self-Employed", "Rental", "Agriculture", "Pension", "Other"])}
                                    {inp("INCOME", "annualIncome", "Annual Income (₹)", "number")}
                                </div>
                                <div style={SEC}>Employer Details</div>
                                <div style={GRID2}>
                                    {inp("INCOME", "employerName", "Employer Name")}
                                    {inp("INCOME", "employerAddress", "Employer Address")}
                                    {inp("INCOME", "employerCity", "City")}
                                    {sel("INCOME", "employerState", "State", STATES)}
                                    {inp("INCOME", "employerPincode", "Pincode")}
                                </div>
                                <div style={SEC}>ITR & Bank Details</div>
                                <div style={GRID3}>
                                    {sel("INCOME", "itrFiled", "ITR Filed?", [{v: "false", l: "No"}, {
                                        v: "true",
                                        l: "Yes"
                                    }])}
                                    {f.itrFiled === "true" && inp("INCOME", "itrYear", "ITR Year", "text", "e.g. 2024-25")}
                                    {f.itrFiled === "true" && inp("INCOME", "itrAmount", "ITR Amount (₹)", "number")}
                                </div>
                                <div style={GRID2}>
                                    {inp("INCOME", "bankAccountNumber", "Account Number")}
                                    {inp("INCOME", "bankName", "Bank Name")}
                                    {inp("INCOME", "bankIfsc", "IFSC Code")}
                                    {inp("INCOME", "bankBranch", "Branch")}
                                </div>
                                <SaveBar section="INCOME"/>
                            </>}

                            {/* KYC */}
                            {activeTab === "KYC" && <>
                                <div style={GRID3}>
                                    {sel("KYC", "kycType", "KYC Type", ["PAN", "AADHAAR", "BOTH"])}
                                    {inp("KYC", "panNumber", "PAN Number")}
                                    {inp("KYC", "aadhaarNumber", "Aadhaar Number")}
                                </div>
                                <SaveBar section="KYC"/>
                            </>}

                            {/* RISK */}
                            {activeTab === "RISK" && <>
                                <div style={GRID2}>
                                    {sel("RISK", "incomeRange", "Income Range", ["<1L", "1L-5L", "5L-10L", "10L-25L", ">25L"])}
                                    {sel("RISK", "occupation", "Occupation", ["Salaried", "Self-Employed", "Business", "Student", "Retired", "Other"])}
                                    {sel("RISK", "riskCategory", "Risk Category", ["LOW", "MEDIUM", "HIGH"])}
                                    {sel("RISK", "politicallyExposedPerson", "Politically Exposed?", [{
                                        v: "false",
                                        l: "No"
                                    }, {v: "true", l: "Yes"}])}
                                </div>
                                <SaveBar section="RISK"/>
                            </>}

                            {/* REVIEW & SUBMIT */}
                            {activeTab === "REVIEW" && <>
                                {/* Customer Summary */}
                                <div style={{
                                    padding: "14px 16px", background: "rgba(200,169,110,.05)",
                                    border: "1px solid rgba(200,169,110,.15)", borderRadius: 8, marginBottom: 20,
                                    display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px 20px"
                                }}>
                                    {[["CIF ID", cifId], ["Name", (detail?.first_name || "") + " " + (detail?.last_name || "")],
                                        ["Status", detail?.cif_status], ["Stage", detail?.onboarding_stage]
                                    ].map(([k, v]) => (
                                        <div key={k}>
                                            <div style={{
                                                fontSize: ".63rem",
                                                color: "#6b7a99",
                                                textTransform: "uppercase",
                                                letterSpacing: ".04em"
                                            }}>{k}</div>
                                            <div style={{
                                                fontSize: ".82rem", fontWeight: 600, marginTop: 3,
                                                fontFamily: k === "CIF ID" ? "IBM Plex Mono,monospace" : "inherit",
                                                color: k === "CIF ID" ? "#c8a96e" : "#e2e8f0"
                                            }}>{v || "—"}</div>
                                        </div>
                                    ))}
                                </div>

                                {savedCount === 0 ? (
                                    <div style={{textAlign: "center", padding: "40px 20px", color: "#6b7a99"}}>
                                        <div style={{fontSize: "2rem", marginBottom: 12}}>📝</div>
                                        <div style={{fontWeight: 600, marginBottom: 6}}>No sections saved yet</div>
                                        <div style={{fontSize: ".8rem"}}>Go to each section, make your changes, and
                                            click <strong style={{color: "#c8a96e"}}>Save Changes</strong> before
                                            submitting.
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{fontSize: ".72rem", color: "#6b7a99", marginBottom: 12}}>
                                            The following <strong
                                            style={{color: "#c8a96e"}}>{savedCount} section{savedCount > 1 ? "s" : ""}</strong> will
                                            be submitted for manager approval:
                                        </div>

                                        {saved["BASIC_INFO"] && (
                                            <ReviewSection title="BASIC INFO" icon="👤" fields={[
                                                ["First Name", forms.BASIC_INFO.firstName], ["Last Name", forms.BASIC_INFO.lastName],
                                                ["Mobile", forms.BASIC_INFO.mobileNo], ["Email", forms.BASIC_INFO.email],
                                            ]}/>
                                        )}
                                        {saved["ADDRESS"] && (
                                            <ReviewSection title="ADDRESS" icon="🏠" fields={[
                                                ["Type", forms.ADDRESS.addressType], ["Line 1", forms.ADDRESS.addressLine1],
                                                ["City", forms.ADDRESS.city], ["State", forms.ADDRESS.state],
                                                ["Pincode", forms.ADDRESS.postalCode], ["Country", forms.ADDRESS.country],
                                            ]}/>
                                        )}
                                        {saved["NOMINEE"] && (
                                            <ReviewSection title="NOMINEE" icon="👥" fields={[
                                                ["Name", forms.NOMINEE.nomineeName], ["Relation", forms.NOMINEE.relation],
                                                ["Phone", forms.NOMINEE.phone], ["PAN", forms.NOMINEE.panNumber],
                                            ]}/>
                                        )}
                                        {saved["INCOME"] && (
                                            <ReviewSection title="INCOME" icon="💰" fields={[
                                                ["Source", forms.INCOME.incomeSource], ["Annual Income", "₹ " + forms.INCOME.annualIncome],
                                                ["Employer", forms.INCOME.employerName], ["Bank", forms.INCOME.bankName],
                                                ["IFSC", forms.INCOME.bankIfsc],
                                            ]}/>
                                        )}
                                        {saved["KYC"] && (
                                            <ReviewSection title="KYC" icon="🪪" fields={[
                                                ["Type", forms.KYC.kycType], ["PAN", forms.KYC.panNumber],
                                                ["Aadhaar", forms.KYC.aadhaarNumber],
                                            ]}/>
                                        )}
                                        {saved["RISK"] && (
                                            <ReviewSection title="RISK" icon="⚠️" fields={[
                                                ["Income Range", forms.RISK.incomeRange], ["Occupation", forms.RISK.occupation],
                                                ["Risk Category", forms.RISK.riskCategory],
                                                ["PEP", forms.RISK.politicallyExposedPerson === "true" ? "Yes" : "No"],
                                            ]}/>
                                        )}

                                        {submitMsg && (
                                            <div style={{
                                                padding: "10px 14px",
                                                borderRadius: 6,
                                                marginBottom: 14,
                                                fontSize: ".82rem",
                                                background: submitMsg.startsWith("⚠") ? "rgba(224,92,92,.1)" : "rgba(72,199,142,.1)",
                                                border: submitMsg.startsWith("⚠") ? "1px solid rgba(224,92,92,.3)" : "1px solid rgba(72,199,142,.3)",
                                                color: submitMsg.startsWith("⚠") ? "#e05c5c" : "#48c78e"
                                            }}>
                                                {submitMsg}
                                            </div>
                                        )}

                                        <div style={{
                                            display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16,
                                            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
                                        }}>
                                            <button onClick={() => navigate(`/customers/${cifId}`)}
                                                    style={{
                                                        padding: "9px 20px",
                                                        borderRadius: 5,
                                                        border: "1px solid rgba(255,255,255,.1)",
                                                        background: "none",
                                                        color: "#6b7a99",
                                                        cursor: "pointer",
                                                        fontFamily: "inherit",
                                                        fontSize: ".82rem"
                                                    }}>
                                                Cancel
                                            </button>
                                            <button onClick={submitAll} disabled={submitting}
                                                    style={{
                                                        padding: "9px 28px",
                                                        borderRadius: 5,
                                                        border: "none",
                                                        background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
                                                        color: "#0a1628",
                                                        cursor: "pointer",
                                                        fontFamily: "inherit",
                                                        fontSize: ".82rem",
                                                        fontWeight: 700
                                                    }}>
                                                {submitting ? "Submitting..." : "✓ Submit All for Approval"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}