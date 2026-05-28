import React, {useEffect, useState} from "react";
import TopBar from "../TopBar";
import {useNavigate, useParams} from "react-router-dom";
import "./customerdetail.css"

const BASE = "http://localhost:8080";
const tok = () => localStorage.getItem("accessToken");
const getRole = () => {
    try {
        const r = JSON.parse(atob(tok().split(".")[1])).role || "";
        return r.replace(/^ROLE_/i, "").toUpperCase();
    } catch { return "OFFICER"; }
};
const getUser = () => {
    try { return JSON.parse(atob(tok().split(".")[1])).sub || ""; } catch { return ""; }
};

const api = async (method, path, body) => {
    const res = await fetch(BASE + path, {
        method,
        headers: {"Content-Type": "application/json", Authorization: "Bearer " + tok()},
        body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"}) : "—";

const STATUS_COLOR = {
    DRAFT:              {c: "#6b7a99", bg: "rgba(107,122,153,.12)"},
    UNDER_REVIEW:       {c: "#f59e0b", bg: "rgba(245,158,11,.12)"},
    APPROVED:           {c: "#48c78e", bg: "rgba(72,199,142,.12)"},
    REJECTED:           {c: "#e05c5c", bg: "rgba(224,92,92,.12)"},
    CLOSED:             {c: "#8a9bb5", bg: "rgba(138,155,181,.12)"},
    CHANGES_REQUESTED:  {c: "#a78bfa", bg: "rgba(167,139,250,.12)"},
    PENDING_MODIFICATION:{c: "#f59e0b", bg: "rgba(245,158,11,.12)"},
};

// ── Overview Panel with tabs ─────────────────────────────────────────────────
const OVERVIEW_TABS = [
    { id:"basic",     label:"Basic Details", icon:"👤" },
    { id:"address",   label:"Address",       icon:"🏠" },
    { id:"kyc",       label:"KYC",           icon:"🪪" },
    { id:"nominee",   label:"Nominee",       icon:"👥" },
    { id:"income",    label:"Income",        icon:"💰" },
    { id:"risk",      label:"Risk Profile",  icon:"⚠️" },
    { id:"followup",  label:"Follow-up",     icon:"🔔" },
    { id:"signature", label:"Signature",     icon:"✍️" },
];

const fmt2 = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

function OverviewPanel({ detail }) {
    const [activeTab, setActiveTab] = React.useState("basic");

    const InfoRow = ({ label, value, mono }) => (
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
            <span style={{fontSize:".62rem",color:"#6b7a99",textTransform:"uppercase",letterSpacing:".04em"}}>{label}</span>
            <span style={{fontSize:".82rem",color:mono?"#c8a96e":"#e2e8f0",
                fontFamily:mono?"IBM Plex Mono,monospace":"inherit",fontWeight:500}}>{value||"—"}</span>
        </div>
    );

    const Grid = ({ children }) => (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px 24px"}}>{children}</div>
    );

    const Section = ({ title }) => (
        <div style={{fontSize:".63rem",fontWeight:700,color:"#c8a96e",letterSpacing:".08em",
            textTransform:"uppercase",borderBottom:"1px solid rgba(200,169,110,.12)",
            paddingBottom:6,margin:"16px 0 12px"}}>{title}</div>
    );

    return (
        <div>
            {/* Tab buttons */}
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16,
                borderBottom:"1px solid rgba(255,255,255,.06)",paddingBottom:12}}>
                {OVERVIEW_TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        style={{padding:"5px 14px",borderRadius:5,cursor:"pointer",
                            fontFamily:"IBM Plex Sans,sans-serif",fontSize:".75rem",fontWeight:600,
                            border:activeTab===t.id?"1px solid rgba(200,169,110,.4)":"1px solid rgba(255,255,255,.07)",
                            background:activeTab===t.id?"rgba(200,169,110,.1)":"rgba(255,255,255,.02)",
                            color:activeTab===t.id?"#c8a96e":"#6b7a99",display:"flex",alignItems:"center",gap:5}}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* BASIC DETAILS */}
            {activeTab === "basic" && (
                <>
                    <Section title="Personal Information"/>
                    <Grid>
                        <InfoRow label="CIF ID"        value={detail.cif_id}          mono/>
                        <InfoRow label="First Name"    value={detail.first_name}/>
                        <InfoRow label="Last Name"     value={detail.last_name}/>
                        <InfoRow label="Date of Birth" value={fmt2(detail.dob)}/>
                        <InfoRow label="PAN Number"    value={detail.pan_no}          mono/>
                        <InfoRow label="Mobile"        value={detail.mobile_no}/>
                        <InfoRow label="Email"         value={detail.email}/>
                        <InfoRow label="Status"        value={detail.cif_status}/>
                        <InfoRow label="Stage"         value={detail.onboarding_stage}/>
                    </Grid>
                    <Section title="Account Information"/>
                    <Grid>
                        <InfoRow label="Created By"    value={detail.created_by}/>
                        <InfoRow label="Created Date"  value={fmt2(detail.created_date)}/>
                        <InfoRow label="Approved By"   value={detail.approved_by}/>
                        <InfoRow label="KYC Status"    value={detail.kyc_status}/>
                        <InfoRow label="Risk Category" value={detail.risk_category}/>
                        <InfoRow label="Remarks"       value={detail.close_remarks}/>
                    </Grid>
                </>
            )}

            {/* ADDRESS */}
            {activeTab === "address" && (
                detail.addresses?.length > 0 ? (
                    <>
                        <Section title="Address Details"/>
                        <Grid>
                            <InfoRow label="Address Type"  value={detail.addresses[0].address_type}/>
                            <InfoRow label="Address Line 1" value={detail.addresses[0].address_line1}/>
                            <InfoRow label="Address Line 2" value={detail.addresses[0].address_line2}/>
                            <InfoRow label="City"          value={detail.addresses[0].city}/>
                            <InfoRow label="State"         value={detail.addresses[0].state}/>
                            <InfoRow label="Postal Code"   value={detail.addresses[0].postal_code}/>
                            <InfoRow label="Country"       value={detail.addresses[0].country}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>🏠</div>
                        <div>No address added yet.</div>
                    </div>
                )
            )}

            {/* KYC */}
            {activeTab === "kyc" && (
                detail.kyc?.length > 0 ? (
                    <>
                        <Section title="KYC Details"/>
                        <Grid>
                            <InfoRow label="KYC Type"       value={detail.kyc[0].kyc_type}/>
                            <InfoRow label="PAN Number"     value={detail.kyc[0].pan_number}     mono/>
                            <InfoRow label="Aadhaar"        value={"XXXX-XXXX-"+(detail.kyc[0].aadhaar_number||"").slice(-4)}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>🪪</div>
                        <div>No KYC details added yet.</div>
                    </div>
                )
            )}

            {/* NOMINEE */}
            {activeTab === "nominee" && (
                detail.nominees?.length > 0 ? (
                    <>
                        <Section title="Nominee Details"/>
                        <Grid>
                            <InfoRow label="Name"          value={detail.nominees[0].nominee_name}/>
                            <InfoRow label="Relation"      value={detail.nominees[0].relation}/>
                            <InfoRow label="Date of Birth" value={fmt2(detail.nominees[0].dob)}/>
                            <InfoRow label="Phone"         value={detail.nominees[0].phone}/>
                            <InfoRow label="Email"         value={detail.nominees[0].email}/>
                            <InfoRow label="PAN"           value={detail.nominees[0].pan_number}   mono/>
                            <InfoRow label="Aadhaar"       value={"XXXX-XXXX-"+(detail.nominees[0].aadhaar_number||"").slice(-4)}/>
                            <InfoRow label="City"          value={detail.nominees[0].city}/>
                            <InfoRow label="State"         value={detail.nominees[0].state}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>👥</div>
                        <div>No nominee added yet.</div>
                    </div>
                )
            )}

            {/* INCOME */}
            {activeTab === "income" && (
                detail.income ? (
                    <>
                        <Section title="Income Details"/>
                        <Grid>
                            <InfoRow label="Income Source"   value={detail.income.income_source}/>
                            <InfoRow label="Annual Income"   value={"₹ "+(detail.income.annual_income||0).toLocaleString("en-IN")}/>
                            <InfoRow label="Employer"        value={detail.income.employer_name}/>
                            <InfoRow label="Employer City"   value={detail.income.employer_city}/>
                            <InfoRow label="Employer State"  value={detail.income.employer_state}/>
                        </Grid>
                        <Section title="ITR Details"/>
                        <Grid>
                            <InfoRow label="ITR Filed"       value={detail.income.itr_filed?"Yes":"No"}/>
                            <InfoRow label="ITR Year"        value={detail.income.itr_year}/>
                            <InfoRow label="ITR Amount"      value={detail.income.itr_amount?"₹ "+detail.income.itr_amount:"—"}/>
                        </Grid>
                        <Section title="Bank Details"/>
                        <Grid>
                            <InfoRow label="Bank Name"       value={detail.income.bank_name}/>
                            <InfoRow label="IFSC"            value={detail.income.bank_ifsc}        mono/>
                            <InfoRow label="Account"         value={"XXXX"+(detail.income.bank_account_number||"").slice(-4)}/>
                            <InfoRow label="Branch"          value={detail.income.bank_branch}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>💰</div>
                        <div>No income details added yet.</div>
                    </div>
                )
            )}

            {/* RISK */}
            {activeTab === "risk" && (
                detail.risk ? (
                    <>
                        <Section title="Risk Profile"/>
                        <Grid>
                            <InfoRow label="Risk Category"  value={detail.risk.risk_category}/>
                            <InfoRow label="Income Range"   value={detail.risk.income_range}/>
                            <InfoRow label="Occupation"     value={detail.risk.occupation}/>
                            <InfoRow label="PEP"            value={detail.risk.politically_exposed_person?"Yes ⚠️":"No"}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>⚠️</div>
                        <div>No risk profile added yet.</div>
                    </div>
                )
            )}

            {/* FOLLOW-UP STATUS */}
            {activeTab === "followup" && (
                <div>
                    <Section title="Follow-up Status"/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px 24px",marginBottom:20}}>
                        <InfoRow label="Current Status"   value={detail.followup_status}/>
                        <InfoRow label="Last Updated"     value={fmt2(detail.followup_updated_at)}/>
                        <InfoRow label="Updated By"       value={detail.followup_updated_by}/>
                        <InfoRow label="Remarks"          value={detail.followup_remarks}/>
                    </div>

                    {/* Status Reference Guide */}
                    <Section title="Status Reference"/>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {[
                            {code:"NORMAL",            name:"Normal",              desc:"Regular active customer",              severity:"LOW",      c:"#48c78e"},
                            {code:"HIGH_TRANSACTIONS",  name:"High Transactions",   desc:"Customer has 20+ transactions",        severity:"MEDIUM",   c:"#f59e0b"},
                            {code:"INOPERATIVE",        name:"Inoperative",         desc:"No transactions for 12+ months",       severity:"MEDIUM",   c:"#f59e0b"},
                            {code:"DORMANT",            name:"Dormant",             desc:"No transactions for 24+ months",       severity:"HIGH",     c:"#ef4444"},
                            {code:"NRI",                name:"NRI Status",          desc:"Customer NRI status change reported",  severity:"MEDIUM",   c:"#a78bfa"},
                            {code:"SUSPICIOUS",         name:"Suspicious Activity", desc:"Flagged for AML/suspicious activity",  severity:"CRITICAL", c:"#ef4444"},
                            {code:"DECEASED",           name:"Deceased",            desc:"Customer death reported",              severity:"CRITICAL", c:"#6b7a99"},
                        ].map(s => (
                            <div key={s.code} style={{
                                display:"flex",alignItems:"center",justifyContent:"space-between",
                                padding:"10px 14px",borderRadius:7,
                                background:detail.followup_status===s.code?"rgba(200,169,110,.08)":"rgba(255,255,255,.02)",
                                border:detail.followup_status===s.code?"1px solid rgba(200,169,110,.3)":"1px solid rgba(255,255,255,.05)",
                            }}>
                                <div style={{display:"flex",alignItems:"center",gap:12}}>
                                    {detail.followup_status===s.code && (
                                        <span style={{fontSize:".7rem",color:"#c8a96e"}}>●</span>
                                    )}
                                    <div>
                                        <div style={{fontSize:".82rem",fontWeight:600,color:"#e2e8f0"}}>{s.name}</div>
                                        <div style={{fontSize:".72rem",color:"#6b7a99",marginTop:2}}>{s.desc}</div>
                                    </div>
                                </div>
                                <span style={{padding:"2px 8px",borderRadius:3,fontSize:".65rem",fontWeight:700,
                                    background:s.c+"22",border:"1px solid "+s.c+"44",color:s.c}}>
                                    {s.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SIGNATURE */}
            {activeTab === "signature" && (
                detail.signature_data ? (
                    <>
                        <Section title="Signature"/>
                        <div style={{background:"#0e1117",border:"1px solid rgba(255,255,255,.08)",
                            borderRadius:6,padding:16,display:"inline-block",marginBottom:12}}>
                            <img src={detail.signature_data.startsWith("data:")
                                ? detail.signature_data : "data:image/png;base64,"+detail.signature_data}
                                alt="Signature" style={{maxWidth:280,maxHeight:140,display:"block"}}/>
                        </div>
                        <Grid>
                            <InfoRow label="Signature Type" value={detail.signature_type}/>
                            <InfoRow label="Signed Date"    value={fmt2(detail.signature_date)}/>
                        </Grid>
                    </>
                ) : (
                    <div style={{textAlign:"center",padding:32,color:"#6b7a99"}}>
                        <div style={{fontSize:"1.5rem",marginBottom:8}}>✍️</div>
                        <div>No signature added yet.</div>
                    </div>
                )
            )}
        </div>
    );
}

export default function CustomerDetail() {
    const {cifId}  = useParams();
    const navigate = useNavigate();
    const role     = getRole();
    const isManager = role === "MANAGER" || role === "ADMIN";

    const [detail,     setDetail]     = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [panel,      setPanel]      = useState(null);
    const [form,       setForm]       = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [msg,        setMsg]        = useState("");

    const load = async () => {
        setLoading(true); setError("");
        try { setDetail(await api("GET", `/api/customers/${cifId}`)); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [cifId]);

    const openPanel  = (id) => { setPanel(id); setForm({}); setMsg(""); };
    const closePanel = ()   => { setPanel(null); setForm({}); setMsg(""); };
    const setF = (k, v) => setForm(p => ({...p, [k]: v}));

    const submit = async () => {
        setSubmitting(true); setMsg("");
        try {
            switch (panel) {
                case "basic-info":
                    await api("PUT", `/api/customers/${cifId}/basic-info`, {
                        firstName: form.firstName || detail.first_name,
                        lastName:  form.lastName  || detail.last_name,
                        mobileNo:  form.mobileNo  || detail.mobile_no,
                        email:     form.email     || detail.email,
                    });
                    setMsg("✓ Basic info updated!"); break;

                case "address":
                    await api("PUT", `/api/customers/${cifId}/address`, {
                        addressType:  form.addressType  || "PERMANENT",
                        addressLine1: form.addressLine1 || "",
                        addressLine2: form.addressLine2 || "",
                        city:         form.city         || "",
                        state:        form.state        || "",
                        postalCode:   form.postalCode   || "",
                        country:      form.country      || "India",
                    });
                    setMsg("✓ Address updated!"); break;

                case "kyc":
                    await api("PUT", `/api/customers/${cifId}/kyc`, {
                        kycType:       form.kycType       || "PAN",
                        panNumber:     form.panNumber     || "",
                        aadhaarNumber: form.aadhaarNumber || "",
                    });
                    setMsg("✓ KYC updated!"); break;

                case "risk":
                    await api("PUT", `/api/customers/${cifId}/risk`, {
                        incomeRange:              form.incomeRange  || "",
                        occupation:               form.occupation   || "",
                        politicallyExposedPerson: form.pep === "true",
                        riskCategory:             form.riskCategory || "LOW",
                    });
                    setMsg("✓ Risk profile saved!"); break;

                case "submit":
                    await api("PUT", `/api/customers/${cifId}/submit`);
                    setMsg("✓ Submitted for review!"); break;

                case "approve":
                    await api("PUT", `/api/customers/${cifId}/approve`, {
                        newStatus: "APPROVED", changedBy: getUser(), remarks: form.remarks || "",
                    });
                    setMsg("✓ Customer approved!"); break;

                case "reject":
                    if (!form.remarks?.trim()) { setMsg("⚠ Remarks required."); setSubmitting(false); return; }
                    await api("PUT", `/api/customers/${cifId}/approve`, {
                        newStatus: "REJECTED", changedBy: getUser(), remarks: form.remarks,
                    });
                    setMsg("✓ Customer rejected."); break;

                case "close":
                    await api("PUT", `/api/customers/${cifId}/close`, {remarks: form.remarks || ""});
                    setMsg("✓ CIF closed."); break;

                case "status":
                    await api("PUT", `/api/customers/${cifId}/status`, {
                        newStatus: form.newStatus, changedBy: getUser(), remarks: form.remarks || "",
                    });
                    setMsg("✓ Status changed to " + form.newStatus); break;

                default: break;
            }
            setTimeout(() => { closePanel(); load(); }, 1500);
        } catch (e) { setMsg("⚠ " + e.message); }
        finally { setSubmitting(false); }
    };

    // ── Tile definitions ──────────────────────────────────────────────────────
    const TILES = [
        // ALL roles
        { id:"overview",  label:"Customer Info",       icon:"👤", color:"#1a3a5c", role:"all",     desc:"View full details" },
        // OFFICER tiles
        { id:"basic-info",label:"Update Basic Info",   icon:"✏️", color:"#1a6b8a", role:"officer", desc:"Edit name, mobile, email" },


        { id:"demand-ops",label:"Demand Ops",          icon:"💳", color:"#0f766e", role:"officer", desc:"Open/view CASA accounts" },


        { id:"address",   label:"Update Address",      icon:"🏠", color:"#1a6b8a", role:"officer", desc:"Add/update address" },
        { id:"kyc",       label:"KYC Details",         icon:"🪪", color:"#2d7a4f", role:"officer", desc:"PAN, Aadhaar" },
        { id:"risk",      label:"Risk Profile",        icon:"⚠️", color:"#2d7a4f", role:"officer", desc:"Income, occupation" },
        { id:"modify",    label:"Request Modification",icon:"🔧", color:"#1a4a7a", role:"officer", desc:"Submit changes for approval",
          disabled: !["APPROVED","DRAFT","REJECTED","CHANGES_REQUESTED"].includes(detail?.cif_status) },
        { id:"submit",    label:"Submit for Review",   icon:"📤", color:"#c8820a", role:"officer", desc:"Move to UNDER_REVIEW",
          disabled: detail?.cif_status !== "DRAFT" },
        // MANAGER tiles
        { id:"approve",   label:"Approve",             icon:"✅", color:"#2d7a4f", role:"manager", desc:"Approve this CIF",
          disabled: detail?.cif_status !== "UNDER_REVIEW" },
        { id:"reject",    label:"Reject",              icon:"❌", color:"#7a1a1a", role:"manager", desc:"Reject this CIF",
          disabled: detail?.cif_status !== "UNDER_REVIEW" },
        { id:"close",     label:"Close CIF",           icon:"🔒", color:"#4a4a4a", role:"manager", desc:"Permanently close",
          disabled: detail?.cif_status !== "APPROVED" },
        { id:"status",    label:"Change Status",       icon:"🔄", color:"#7a4f1a", role:"manager", desc:"Force status change" },
        { id:"modifications", label:"View Modifications", icon:"📋", color:"#2d4a6b", role:"manager", desc:"Pending mod requests" },
    ].filter(t => {
        if (t.role === "all")     return true;
        if (t.role === "officer") return true;
        if (t.role === "manager") return isManager;
        return false;
    });

    if (loading) return (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
            background:"#0e1117",color:"#6b7a99",fontFamily:"IBM Plex Sans,sans-serif",flexDirection:"column",gap:12}}>
            <div style={{fontSize:"1.5rem"}}>⏳</div>Loading...
        </div>
    );
    if (error) return (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
            background:"#0e1117",color:"#e05c5c",fontFamily:"IBM Plex Sans,sans-serif",flexDirection:"column",gap:12}}>
            ⚠ {error}
            <button onClick={() => navigate(-1)} style={{padding:"6px 16px",borderRadius:5,
                border:"1px solid #e05c5c33",background:"#e05c5c18",color:"#e05c5c",cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
        </div>
    );

    const st = STATUS_COLOR[detail?.cif_status] || STATUS_COLOR.DRAFT;

    return (
        <>
            <div className="cd-root">
          <TopBar breadcrumb={[{label:"Customer Operations",path:"/customers"},{label:cifId}]}/>

                {/* NAV */}
                <nav className="cd-nav">
                    <button className="cd-back" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        Back
                    </button>
                    <div style={{width:1, height:20, background:"rgba(255,255,255,.1)"}}/>
                    <span style={{fontFamily:"IBM Plex Mono,monospace",color:"#c8a96e",fontSize:".85rem",fontWeight:600}}>{cifId}</span>
                    <span style={{fontSize:".75rem",color:"#6b7a99",marginLeft:4}}>— Customer Operations</span>
                </nav>

                {/* HERO */}
                <div className="cd-hero">
                    <div className="cd-hero-row">
                        <div className="cd-avatar">
                            {((detail.first_name||"?")[0]+(detail.last_name||"?")[0]).toUpperCase()}
                        </div>
                        <div>
                            <div className="cd-name">{(detail.first_name||"")+" "+(detail.last_name||"")}</div>
                            <div className="cd-meta">
                                <span className="cd-badge" style={{color:st.c,background:st.bg}}>{detail.cif_status}</span>
                                <span className="cd-mono">{detail.mobile_no}</span>
                                {detail.email && <span className="cd-mono">{detail.email}</span>}
                                <span className="cd-label">Stage: <span>{detail.onboarding_stage||"—"}</span></span>
                                <span className="cd-label">PAN: <span style={{fontFamily:"IBM Plex Mono,monospace"}}>{detail.pan_no||"—"}</span></span>
                                <span className="cd-label">Created: <span>{fmt(detail.created_date)}</span></span>
                                <span className="cd-label">By: <span>{detail.created_by||"—"}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TILES */}
                <div className="cd-section-title">Available Operations</div>
                <div className="cd-tiles">
                    {TILES.map(t => (
                        <div key={t.id}
                            className={"cd-tile"+(t.disabled?" disabled":"")+(panel===t.id?" active":"")}
                            style={{background:`linear-gradient(135deg,${t.color}cc,${t.color}88)`}}
                            onClick={() => {
                                if (t.disabled) return;
                                if (t.id === "modify")         navigate(`/customers/${cifId}/modify`);
                                else if (t.id === "modifications") navigate(`/modifications/pending`);
//                                 else if (t.id === "demand-ops")    navigate(`/demand-ops/${cifId}`);
                                else if (t.id === "demand-ops")    navigate(`/customers/${cifId}/demand-account`);
                                else openPanel(t.id);
                            }}>
                            <div className="cd-tile-icon">{t.icon}</div>
                            <div className="cd-tile-label">{t.label}</div>
                            <div className="cd-tile-desc">{t.desc}</div>
                            {t.disabled && <div style={{position:"absolute",top:6,right:8,fontSize:".6rem",color:"rgba(255,255,255,.4)"}}>N/A</div>}
                        </div>
                    ))}
                </div>

                {/* OPERATION PANEL */}
                {panel && (
                    <div className="cd-panel">
                        <div className="cd-panel-head">
                            <span className="cd-panel-title">
                                {TILES.find(t=>t.id===panel)?.icon} {TILES.find(t=>t.id===panel)?.label}
                            </span>
                            <button className="cd-panel-close" onClick={closePanel}>✕</button>
                        </div>
                        <div className="cd-panel-body">

                            {/* OVERVIEW */}
                            {panel === "overview" && (
                                <OverviewPanel detail={detail} />
                            )}

                            {panel === "basic-info" && (
                                <div className="cd-pgrid">
                                    {[["firstName","First Name",detail.first_name],["lastName","Last Name",detail.last_name],
                                      ["mobileNo","Mobile",detail.mobile_no],["email","Email",detail.email]
                                    ].map(([k,lbl,def])=>(
                                        <div key={k} className="cd-pfield">
                                            <label className="cd-plabel">{lbl}</label>
                                            <input className="cd-pinput" defaultValue={def||""} onChange={e=>setF(k,e.target.value)}/>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ADDRESS */}
                            {panel === "address" && (
                                <div className="cd-pgrid">
                                    {[["addressType","Address Type"],["addressLine1","Line 1"],["addressLine2","Line 2"],
                                      ["city","City"],["state","State"],["postalCode","Pincode"],["country","Country"]
                                    ].map(([k,lbl])=>(
                                        <div key={k} className="cd-pfield">
                                            <label className="cd-plabel">{lbl}</label>
                                            {k==="addressType" ? (
                                                <select className="cd-pinput" onChange={e=>setF(k,e.target.value)} style={{cursor:"pointer"}}>
                                                    <option value="PERMANENT">Permanent</option>
                                                    <option value="CORRESPONDENCE">Correspondence</option>
                                                    <option value="OFFICE">Office</option>
                                                </select>
                                            ) : (
                                                <input className="cd-pinput"
                                                    defaultValue={detail.addresses?.[0]?.[k.replace(/([A-Z])/g,'_$1').toLowerCase()]||""}
                                                    onChange={e=>setF(k,e.target.value)}/>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* KYC */}
                            {panel === "kyc" && (
                                <div className="cd-pgrid">
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">KYC Type</label>
                                        <select className="cd-pinput" onChange={e=>setF("kycType",e.target.value)} style={{cursor:"pointer"}}>
                                            <option value="PAN">PAN</option>
                                            <option value="AADHAAR">Aadhaar</option>
                                            <option value="BOTH">Both</option>
                                        </select>
                                    </div>
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">PAN Number</label>
                                        <input className="cd-pinput" defaultValue={detail.kyc?.[0]?.pan_number||""} onChange={e=>setF("panNumber",e.target.value)}/>
                                    </div>
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">Aadhaar Number</label>
                                        <input className="cd-pinput" placeholder="12 digits" onChange={e=>setF("aadhaarNumber",e.target.value)}/>
                                    </div>
                                </div>
                            )}

                            {/* RISK */}
                            {panel === "risk" && (
                                <div className="cd-pgrid">
                                    {[["incomeRange","Income Range",["<1L","1L-5L","5L-10L","10L-25L",">25L"]],
                                      ["occupation","Occupation",["Salaried","Self-Employed","Business","Student","Retired","Other"]],
                                      ["riskCategory","Risk Category",["LOW","MEDIUM","HIGH"]]
                                    ].map(([k,lbl,opts])=>(
                                        <div key={k} className="cd-pfield">
                                            <label className="cd-plabel">{lbl}</label>
                                            <select className="cd-pinput" onChange={e=>setF(k,e.target.value)} style={{cursor:"pointer"}}>
                                                <option value="">Select</option>
                                                {opts.map(o=><option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">Politically Exposed?</label>
                                        <select className="cd-pinput" onChange={e=>setF("pep",e.target.value)} style={{cursor:"pointer"}}>
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* SUBMIT FOR REVIEW */}
                            {panel === "submit" && (
                                <div style={{color:"#8a9bb5",fontSize:".85rem",marginBottom:12}}>
                                    This will move <strong style={{color:"#c8a96e"}}>{cifId}</strong> from <strong>DRAFT</strong> to <strong style={{color:"#f59e0b"}}>UNDER_REVIEW</strong> for manager approval.
                                </div>
                            )}

                            {/* APPROVE */}
                            {panel === "approve" && (
                                <>
                                    <div style={{color:"#8a9bb5",fontSize:".85rem",marginBottom:10}}>
                                        Approving <strong style={{color:"#c8a96e"}}>{cifId}</strong> — {(detail.first_name||"")+" "+(detail.last_name||"")}
                                    </div>
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">Remarks (optional)</label>
                                        <textarea className="cd-pinput" rows={3} style={{resize:"vertical"}}
                                            onChange={e=>setF("remarks",e.target.value)} placeholder="Approval remarks..."/>
                                    </div>
                                </>
                            )}

                            {/* REJECT */}
                            {panel === "reject" && (
                                <div className="cd-pfield">
                                    <label className="cd-plabel">Rejection Reason *</label>
                                    <textarea className="cd-pinput" rows={3} style={{resize:"vertical"}}
                                        onChange={e=>setF("remarks",e.target.value)} placeholder="Required — explain reason for rejection..."/>
                                </div>
                            )}

                            {/* CLOSE */}
                            {panel === "close" && (
                                <>
                                    <div style={{color:"#e05c5c",fontSize:".82rem",marginBottom:10}}>
                                        ⚠ This will permanently close CIF <strong>{cifId}</strong>. This action cannot be undone.
                                    </div>
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">Close Remarks</label>
                                        <textarea className="cd-pinput" rows={3} style={{resize:"vertical"}}
                                            onChange={e=>setF("remarks",e.target.value)} placeholder="Reason for closing..."/>
                                    </div>
                                </>
                            )}

                            {/* STATUS CHANGE */}
                            {panel === "status" && (
                                <div className="cd-pgrid">
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">New Status</label>
                                        <select className="cd-pinput" onChange={e=>setF("newStatus",e.target.value)} style={{cursor:"pointer"}}>
                                            <option value="">-- Select --</option>
                                            {["APPROVED","REJECTED","UNDER_REVIEW","CHANGES_REQUESTED","DRAFT"].map(s=>(
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="cd-pfield">
                                        <label className="cd-plabel">Remarks</label>
                                        <input className="cd-pinput" onChange={e=>setF("remarks",e.target.value)} placeholder="Optional..."/>
                                    </div>
                                </div>
                            )}

                            {/* SUBMIT BUTTON */}
                            {panel !== "overview" && (
                                <div className="cd-psub">
                                    <button onClick={closePanel}
                                        style={{padding:"7px 16px",borderRadius:5,border:"1px solid rgba(255,255,255,.1)",
                                            background:"none",color:"#6b7a99",cursor:"pointer",fontFamily:"inherit",fontSize:".8rem"}}>
                                        Cancel
                                    </button>
                                    <button onClick={submit} disabled={submitting}
                                        style={{padding:"7px 20px",borderRadius:5,border:"none",
                                            background:"linear-gradient(135deg,#c8a96e,#a07840)",
                                            color:"#0a1628",cursor:"pointer",fontFamily:"inherit",fontSize:".8rem",fontWeight:700}}>
                                        {submitting ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}

                            {msg && <div className={"cd-msg "+(msg.startsWith("⚠")?"err":"ok")}>{msg}</div>}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}