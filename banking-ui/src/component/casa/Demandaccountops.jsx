// import {useEffect, useState} from "react";
// import {useNavigate, useParams} from "react-router-dom";
// import TopBar from "../customers/Topbar";
//
// const BASE = "http://localhost:8080";
// const tok = () => localStorage.getItem("accessToken");
// const getUser = () => {
//     try {
//         return JSON.parse(atob(tok().split(".")[1])).sub || "";`
//         `
//     } catch {
//         return "";
//     }
// };
// const getRole = () => {
//     try {
//         return JSON.parse(atob(tok().split(".")[1])).role?.replace(/^ROLE_/i, "").toUpperCase() || "";
//     } catch {
//         return "";
//     }
// };
// const api = async (method, path, body) => {
//     const res = await fetch(BASE + path, {
//         method,
//         headers: {"Content-Type": "application/json", Authorization: "Bearer " + tok()},
//         body: body ? JSON.stringify(body) : undefined,
//     });
//     let data;
//     try {
//         data = await res.json();
//     } catch {
//         data = {};
//     }
//     if (!res.ok) throw new Error(data.message || "Request failed");
//     return data;
// };
// const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"}) : "—";
// const fmtAmt = (n) => n != null ? "₹ " + Number(n).toLocaleString("en-IN") : "—";
//
// const STATUS_COLOR = {
//     PENDING_APPROVAL: {c: "#f59e0b", bg: "rgba(245,158,11,.12)"},
//     ACTIVE: {c: "#48c78e", bg: "rgba(72,199,142,.12)"},
//     REJECTED: {c: "#e05c5c", bg: "rgba(224,92,92,.12)"},
//     CLOSED: {c: "#6b7a99", bg: "rgba(107,122,153,.12)"},
// };
// const TYPE_ICON = {SAVINGS: "💰", CURRENT: "🏦", SALARY: "💼", NRI: "🌐"};
//
// const STEPS = [
//     {id: 1, label: "Basic Info", icon: "🏦"},
//     {id: 2, label: "Nominee", icon: "👥"},
//     {id: 3, label: "Charges", icon: "💳"},
//     {id: 4, label: "Review", icon: "✅"},
// ];
//
// const FACILITIES = [
//     {id: "chequeBook", label: "Cheque Book", icon: "📒", desc: "Issue cheque book"},
//     {id: "debitCard", label: "Debit Card", icon: "💳", desc: "ATM/Debit card"},
//     {id: "internetBanking", label: "Internet Banking", icon: "🌐", desc: "Online banking access"},
//     {id: "mobileBanking", label: "Mobile Banking", icon: "📱", desc: "Mobile app access"},
//     {id: "smsAlerts", label: "SMS Alerts", icon: "📲", desc: "Transaction SMS alerts"},
//     {id: "emailAlerts", label: "Email Alerts", icon: "📧", desc: "Transaction email alerts"},
//     {id: "passbook", label: "Passbook", icon: "📔", desc: "Physical passbook"},
//     {id: "lockerFacility", label: "Locker Facility", icon: "🔐", desc: "Safe deposit locker"},
// ];
//
// const INPUT = {
//     width: "100%", padding: "8px 12px", background: "#0e1117",
//     border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "#e2e8f0",
//     fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", outline: "none"
// };
// const SELECT = {...INPUT, cursor: "pointer"};
// const LABEL = {
//     fontSize: ".63rem", color: "#6b7a99", textTransform: "uppercase",
//     letterSpacing: ".04em", display: "block", marginBottom: 4
// };
// const GRID2 = {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px"};
// const GRID3 = {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px"};
// const SEC = {
//     fontSize: ".63rem", fontWeight: 700, color: "#c8a96e", letterSpacing: ".08em",
//     textTransform: "uppercase", borderBottom: "1px solid rgba(200,169,110,.12)",
//     // paddingBottom: 6, margin: "18px 0 12px", color: "#c8a96e"
// };
//
// export default function DemandAccountOps() {
//     const {cifId} = useParams();
//     const navigate = useNavigate();
//     const role = getRole();
//     const isManager = role === "MANAGER" || role === "ADMIN";
//
//     const [customer, setCustomer] = useState(null);
//     const [accounts, setAccounts] = useState([]);
//     const [branches, setBranches] = useState([]);
//     const [schemes, setSchemes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [view, setView] = useState("list");
//     const [step, setStep] = useState(1);
//     const [error, setError] = useState("");
//     const [msg, setMsg] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//
//     // Step 1 — Basic Info
//     const [basicForm, setBasicForm] = useState({
//         accountType: "SAVINGS", branchCode: "", schemeCode: "", initialDeposit: "",
//         isJoint: false, jointCifId: "", jointHolderName: "", jointHolderPan: "",
//     });
//     const [jointCustomer, setJointCustomer] = useState(null);
//     const [jointLoading, setJointLoading] = useState(false);
//     const [jointError, setJointError] = useState("");
//
//     // Step 2 — Nominee
//     const [nomineeId, setNomineeId] = useState("");
//
//     // Step 3 — Charges/Facilities
//     const [facilities, setFacilities] = useState({
//         chequeBook: false, debitCard: false, internetBanking: false,
//         mobileBanking: false, smsAlerts: false, emailAlerts: false,
//         passbook: false, lockerFacility: false,
//     });
//
//     // Manager approval modal
//     const [selectedAcc, setSelectedAcc] = useState(null);
//     const [remarks, setRemarks] = useState("");
//     const [acting, setActing] = useState(null);
//
//     const load = async () => {
//         setLoading(true);
//         try {
//             const [cust, accs, brs] = await Promise.all([
//                 api("GET", `/api/customers/${cifId}`),
//                 api("GET", `/api/casa/cif/${cifId}`),
//                 api("GET", `/api/casa/branches`),
//             ]);
//             setCustomer(cust);
//             setAccounts(Array.isArray(accs) ? accs : []);
//             setBranches(Array.isArray(brs) ? brs : []);
//             if (cust?.branch_id) setBasicForm(p => ({...p, branchCode: cust.branch_id}));
//         } catch (e) {
//             setError(e.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => {
//         load();
//     }, [cifId]);
//
//     useEffect(() => {
//         if (!basicForm.accountType) return;
//         api("GET", `/api/casa/schemes?accountType=${basicForm.accountType}`)
//             .then(data => {
//                 setSchemes(Array.isArray(data) ? data : []);
//                 setBasicForm(p => ({...p, schemeCode: ""}));
//             })
//             .catch(() => {
//             });
//     }, [basicForm.accountType]);
//
//     // CIF lookup for joint account
//     const lookupJointCif = async () => {
//         if (!basicForm.jointCifId) return;
//         setJointLoading(true);
//         setJointError("");
//         try {
//             const data = await api("GET", `/api/customers/${basicForm.jointCifId}`);
//             setJointCustomer(data);
//             setBasicForm(p => ({
//                 ...p,
//                 jointHolderName: (data.first_name || "") + " " + (data.last_name || ""),
//                 jointHolderPan: data.pan_no || ""
//             }));
//         } catch (e) {
//             setJointError("CIF not found: " + e.message);
//             setJointCustomer(null);
//         } finally {
//             setJointLoading(false);
//         }
//     };
//
//     const submitAccount = async () => {
//         if (!basicForm.branchCode || !basicForm.schemeCode)
//             return setError("Branch and Scheme are required.");
//         setSubmitting(true);
//         setError("");
//         setMsg("");
//         try {
//             const res = await api("POST", "/api/casa/create", {
//                 cifId,
//                 accountType: basicForm.accountType,
//                 branchCode: basicForm.branchCode,
//                 schemeCode: basicForm.schemeCode,
//                 initialDeposit: basicForm.initialDeposit ? parseFloat(basicForm.initialDeposit) : 0,
//                 nomineeId: nomineeId || "",
//                 isJoint: basicForm.isJoint,
//                 jointHolderName: basicForm.jointHolderName || "",
//                 jointHolderCif: basicForm.jointCifId || "",
//                 jointHolderPan: basicForm.jointHolderPan || "",
//                 facilities: facilities,
//                 createdBy: getUser(),
//             });
//             setMsg(`✓ Account created! Account Number: ${res.accountNumber}`);
//             setView("list");
//             setStep(1);
//             load();
//         } catch (e) {
//             setError("⚠ " + e.message);
//         } finally {
//             setSubmitting(false);
//         }
//     };
//
//     const handleStatus = async (status) => {
//         setActing(status);
//         try {
//             await api("PUT", `/api/casa/${selectedAcc.account_id}/status`, {
//                 newStatus: status, changedBy: getUser(), remarks,
//             });
//             setMsg(`✓ Account ${status === "ACTIVE" ? "approved" : "rejected"}!`);
//             setSelectedAcc(null);
//             setRemarks("");
//             load();
//         } catch (e) {
//             setError("⚠ " + e.message);
//         } finally {
//             setActing(null);
//         }
//     };
//
//     const nextStep = () => {
//         setError("");
//         setStep(s => s + 1);
//     };
//     const prevStep = () => {
//         setError("");
//         setStep(s => s - 1);
//     };
//
//     if (loading) return (
//         <div style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             height: "100vh",
//             background: "#0e1117",
//             color: "#6b7a99",
//             fontFamily: "IBM Plex Sans,sans-serif",
//             flexDirection: "column",
//             gap: 12
//         }}>
//             <div style={{fontSize: "1.5rem"}}>⏳</div>
//             Loading...
//         </div>
//     );
//
//     const selectedScheme = schemes.find(s => s.scheme_code === basicForm.schemeCode);
//
//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
//         * { box-sizing:border-box; margin:0; padding:0; }
//         body { background:#0e1117; }
//         .da-root { min-height:100vh; background:#0e1117; color:#e2e8f0; font-family:'IBM Plex Sans',sans-serif; }
//         .da-nav { display:flex; align-items:center; gap:12px; padding:0 24px; height:52px;
//           background:#111827; border-bottom:1px solid rgba(255,255,255,.07); }
//         .da-back { background:none; border:none; color:#8a9bb5; cursor:pointer; font-size:.8rem;
//           padding:5px 8px; border-radius:5px; font-family:inherit; display:flex; align-items:center; gap:5px; }
//         .da-back:hover { background:rgba(255,255,255,.05); color:#e2e8f0; }
//         .da-back svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.5; }
//         .da-body { padding:20px 24px; max-width:1100px; }
//         .da-hero { padding:16px 20px; background:#161b26; border:1px solid rgba(255,255,255,.07);
//           border-radius:10px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; }
//         .da-card { background:#161b26; border:1px solid rgba(255,255,255,.07); border-radius:10px; overflow:hidden; }
//         .da-card-head { padding:14px 18px; background:rgba(200,169,110,.04);
//           border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; }
//         .da-card-title { font-size:.88rem; font-weight:700; color:#c8a96e; }
//         .da-stepper { display:flex; align-items:center; padding:16px 20px 0; overflow-x:auto; gap:0; }
//         .da-step { display:flex; align-items:center; gap:7px; padding:7px 10px; border-radius:6px; flex-shrink:0; }
//         .da-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center;
//           justify-content:center; font-size:.72rem; font-weight:700; flex-shrink:0; }
//         .da-step.done .da-dot    { background:rgba(72,199,142,.12); color:#48c78e; border:1.5px solid #48c78e; }
//         .da-step.active .da-dot  { background:rgba(200,169,110,.18); color:#c8a96e; border:1.5px solid #c8a96e; }
//         .da-step.pending .da-dot { background:rgba(255,255,255,.04); color:#6b7a99; border:1.5px solid rgba(255,255,255,.08); }
//         .da-lbl { font-size:.73rem; font-weight:600; }
//         .da-step.done .da-lbl    { color:#48c78e; }
//         .da-step.active .da-lbl  { color:#c8a96e; }
//         .da-step.pending .da-lbl { color:#6b7a99; }
//         .da-conn { flex:1; height:1px; min-width:12px; background:rgba(255,255,255,.07); }
//         .da-step-body { padding:20px; }
//         table { width:100%; border-collapse:collapse; }
//         thead th { padding:10px 14px; text-align:left; font-size:.65rem; font-weight:600;
//           color:#6b7a99; letter-spacing:.06em; text-transform:uppercase;
//           border-bottom:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); }
//         tbody tr { border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s; }
//         tbody tr:hover { background:rgba(255,255,255,.03); }
//         tbody td { padding:11px 14px; font-size:.8rem; }
//         .acc-no { font-family:'IBM Plex Mono',monospace; color:#c8a96e; font-size:.75rem; }
//         .badge  { display:inline-flex; padding:2px 8px; border-radius:3px; font-size:.68rem; font-weight:600; }
//         .da-empty { padding:48px; text-align:center; color:#6b7a99; }
//         .facility-card { border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:14px;
//           display:flex; align-items:center; justify-content:space-between; cursor:pointer;
//           transition:all .2s; }
//         .facility-card:hover { border-color:rgba(200,169,110,.3); background:rgba(200,169,110,.04); }
//         .facility-card.active { border-color:rgba(72,199,142,.4); background:rgba(72,199,142,.06); }
//         .toggle { width:42px; height:22px; border-radius:11px; position:relative; cursor:pointer;
//           border:none; transition:background .2s; flex-shrink:0; }
//         .toggle.on  { background:#48c78e; }
//         .toggle.off { background:rgba(255,255,255,.1); }
//         .toggle::after { content:''; position:absolute; top:3px; width:16px; height:16px;
//           border-radius:50%; background:white; transition:left .2s; }
//         .toggle.on::after  { left:23px; }
//         .toggle.off::after { left:3px; }
//         input:focus, select:focus { border-color:rgba(200,169,110,.5) !important; outline:none; }
//         .da-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:200;
//           display:flex; align-items:center; justify-content:center; padding:20px; }
//         .da-modal { background:#161b26; border:1px solid rgba(200,169,110,.2); border-radius:10px;
//           width:100%; max-width:560px; }
//         .da-modal-head { padding:16px 20px; background:rgba(200,169,110,.05);
//           border-bottom:1px solid rgba(255,255,255,.06);
//           display:flex; align-items:center; justify-content:space-between; }
//         .da-modal-body { padding:20px; }
//         .da-modal-foot { padding:14px 20px; border-top:1px solid rgba(255,255,255,.06);
//           display:flex; justify-content:flex-end; gap:10px; }
//         .review-row { display:flex; justify-content:space-between; padding:6px 0;
//           border-bottom:1px solid rgba(255,255,255,.04); font-size:.8rem; }
//         .review-key { color:#6b7a99; }
//         .review-val { color:#e2e8f0; font-weight:500; text-align:right; }
//       `}</style>
//
//             <div className="da-root">
//                 <TopBar breadcrumb={[{label: "Customer Operations", path: "/customers"}, {
//                     label: cifId,
//                     path: `/customers/${cifId}`
//                 }, {label: "Demand Account Ops"}]}/>
//
//                 <nav className="da-nav">
//                     <button className="da-back" onClick={() => navigate(`/customers/${cifId}`)}>
//                         <svg viewBox="0 0 24 24">
//                             <polyline points="15 18 9 12 15 6"/>
//                         </svg>
//                         Back
//                     </button>
//                     <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
//                     <span style={{
//                         fontFamily: "IBM Plex Mono,monospace",
//                         color: "#c8a96e",
//                         fontSize: ".85rem",
//                         fontWeight: 600
//                     }}>{cifId}</span>
//                     <span style={{color: "#6b7a99", fontSize: ".8rem"}}>— Demand Account Operations</span>
//                 </nav>
//
//                 <div className="da-body">
//                     {/* CUSTOMER HERO */}
//                     {customer && (
//                         <div className="da-hero">
//                             <div style={{display: "flex", alignItems: "center", gap: 14}}>
//                                 <div style={{
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 10,
//                                     background: "linear-gradient(135deg,#1a3a5c,#0e1117)",
//                                     border: "1px solid rgba(200,169,110,.25)",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     fontSize: ".9rem",
//                                     fontWeight: 700,
//                                     color: "#c8a96e"
//                                 }}>
//                                     {((customer.first_name || "?")[0] + (customer.last_name || "?")[0]).toUpperCase()}
//                                 </div>
//                                 <div>
//                                     <div style={{
//                                         fontWeight: 700,
//                                         fontSize: ".95rem"
//                                     }}>{customer.first_name} {customer.last_name}</div>
//                                     <div style={{display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap"}}>
//                                         <span style={{fontSize: ".72rem", color: "#8a9bb5"}}>{customer.mobile_no}</span>
//                                         <span style={{
//                                             fontSize: ".72rem",
//                                             color: "#8a9bb5",
//                                             fontFamily: "IBM Plex Mono,monospace"
//                                         }}>{customer.pan_no}</span>
//                                         <span style={{
//                                             padding: "1px 8px",
//                                             borderRadius: 3,
//                                             fontSize: ".68rem",
//                                             fontWeight: 600,
//                                             background: "rgba(72,199,142,.1)",
//                                             color: "#48c78e",
//                                             border: "1px solid rgba(72,199,142,.3)"
//                                         }}>
//                       {customer.cif_status}
//                     </span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div style={{display: "flex", gap: 16, textAlign: "center"}}>
//                                 <div>
//                                     <div style={{
//                                         fontSize: "1.4rem",
//                                         fontWeight: 700,
//                                         color: "#c8a96e"
//                                     }}>{accounts.length}</div>
//                                     <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Total</div>
//                                 </div>
//                                 <div>
//                                     <div style={{fontSize: "1.4rem", fontWeight: 700, color: "#48c78e"}}>
//                                         {accounts.filter(a => a.account_status === "ACTIVE").length}
//                                     </div>
//                                     <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Active</div>
//                                 </div>
//                                 <div>
//                                     <div style={{fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b"}}>
//                                         {accounts.filter(a => a.account_status === "PENDING_APPROVAL").length}
//                                     </div>
//                                     <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Pending</div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//
//                     {msg && <div style={{
//                         padding: "8px 14px",
//                         borderRadius: 6,
//                         marginBottom: 14,
//                         background: "rgba(72,199,142,.1)",
//                         border: "1px solid rgba(72,199,142,.3)",
//                         color: "#48c78e",
//                         fontSize: ".82rem"
//                     }}>{msg}</div>}
//                     {error && <div style={{
//                         padding: "8px 14px",
//                         borderRadius: 6,
//                         marginBottom: 14,
//                         background: "rgba(224,92,92,.1)",
//                         border: "1px solid rgba(224,92,92,.3)",
//                         color: "#e05c5c",
//                         fontSize: ".82rem"
//                     }}>{error}</div>}
//
//                     {/* TABS */}
//                     <div style={{display: "flex", gap: 8, marginBottom: 16}}>
//                         {[{id: "list", label: "Accounts", icon: "🏦"}, {
//                             id: "create",
//                             label: "Open New Account",
//                             icon: "➕"
//                         }].map(t => (
//                             <button key={t.id} onClick={() => {
//                                 setView(t.id);
//                                 setStep(1);
//                                 setError("");
//                                 setMsg("");
//                             }}
//                                     style={{
//                                         padding: "8px 18px",
//                                         borderRadius: 6,
//                                         cursor: "pointer",
//                                         fontFamily: "IBM Plex Sans,sans-serif",
//                                         fontSize: ".82rem",
//                                         fontWeight: 600,
//                                         display: "flex",
//                                         alignItems: "center",
//                                         gap: 8,
//                                         border: view === t.id ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.08)",
//                                         background: view === t.id ? "rgba(200,169,110,.1)" : "rgba(255,255,255,.03)",
//                                         color: view === t.id ? "#c8a96e" : "#6b7a99"
//                                     }}>
//                                 {t.icon} {t.label}
//                             </button>
//                         ))}
//                     </div>
//
//                     {/* ── ACCOUNTS LIST ──────────────────────────────────────────────── */}
//                     {view === "list" && (
//                         <div className="da-card">
//                             <div className="da-card-head">
//                                 <span className="da-card-title">🏦 CASA Accounts</span>
//                                 <span style={{fontSize: ".72rem", color: "#6b7a99"}}>{accounts.length} account(s)</span>
//                             </div>
//                             {accounts.length === 0 ? (
//                                 <div className="da-empty">
//                                     <div style={{fontSize: "2rem", marginBottom: 10}}>🏦</div>
//                                     <div style={{fontWeight: 600, marginBottom: 4}}>No accounts yet</div>
//                                     <div style={{fontSize: ".78rem"}}>Click "Open New Account" to create a CASA
//                                         account.
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <table>
//                                     <thead>
//                                     <tr>
//                                         <th>Account Number</th>
//                                         <th>Type</th>
//                                         <th>Branch</th>
//                                         <th>Scheme</th>
//                                         <th>Interest</th>
//                                         <th>Balance</th>
//                                         <th>Status</th>
//                                         <th>Created</th>
//                                         {isManager && <th>Action</th>}
//                                     </tr>
//                                     </thead>
//                                     <tbody>
//                                     {accounts.map(a => {
//                                         const sc = STATUS_COLOR[a.account_status] || STATUS_COLOR.PENDING_APPROVAL;
//                                         return (
//                                             <tr key={a.account_id}>
// // {/*                                                 <td> */}
// // {/*                                                     <span className="acc-no">{a.account_number}</span> */}
// // {/*                                                     </td> */}
// <td>
//   <span className="acc-no"
//     style={{cursor:"pointer", textDecoration:"underline", textDecorationStyle:"dotted"}}
//     onClick={() => setDetailAcc(a)}>
//     {a.account_number}
//   </span>
// </td>
//                                                 <td>{TYPE_ICON[a.account_type]} {a.account_type}</td>
//                                                 <td style={{
//                                                     fontSize: ".75rem",
//                                                     color: "#8a9bb5"
//                                                 }}>{a.branch_name || "—"}</td>
//                                                 <td style={{
//                                                     fontSize: ".75rem",
//                                                     color: "#8a9bb5"
//                                                 }}>{a.scheme_name || "—"}</td>
//                                                 <td style={{color: "#c8a96e"}}>{a.interest_rate ? a.interest_rate + "%" : "—"}</td>
//                                                 <td style={{fontWeight: 600}}>{fmtAmt(a.current_balance)}</td>
//                                                 <td><span className="badge" style={{
//                                                     color: sc.c,
//                                                     background: sc.bg
//                                                 }}>{a.account_status}</span></td>
//                                                 <td style={{
//                                                     fontSize: ".72rem",
//                                                     color: "#6b7a99"
//                                                 }}>{fmt(a.created_date)}</td>
//                                                 {isManager && (
//                                                     <td>
//                                                         {a.account_status === "PENDING_APPROVAL" && (
//                                                             <button onClick={() => {
//                                                                 setSelectedAcc(a);
//                                                                 setRemarks("");
//                                                             }}
//                                                                     style={{
//                                                                         padding: "4px 12px",
//                                                                         borderRadius: 4,
//                                                                         border: "1px solid rgba(200,169,110,.3)",
//                                                                         background: "rgba(200,169,110,.08)",
//                                                                         color: "#c8a96e",
//                                                                         cursor: "pointer",
//                                                                         fontFamily: "inherit",
//                                                                         fontSize: ".72rem",
//                                                                         fontWeight: 600
//                                                                     }}>
//                                                                 Review
//                                                             </button>
//                                                         )}
//                                                     </td>
//                                                 )}
//                                             </tr>
//                                         );
//                                     })}
//                                     </tbody>
//                                 </table>
//                             )}
//                         </div>
//                     )}
//
//                     {/* ── CREATE ACCOUNT — 4 STEP FLOW ─────────────────────────────── */}
//                     {view === "create" && (
//                         <div className="da-card">
//                             <div className="da-card-head">
//                                 <span className="da-card-title">➕ Open New CASA Account</span>
//                                 <span style={{fontSize: ".72rem", color: "#6b7a99"}}>Step {step} of 4</span>
//                             </div>
//
//                             {/* STEPPER */}
//                             <div className="da-stepper">
//                                 {STEPS.map((s, i) => {
//                                     const state = step > s.id ? "done" : step === s.id ? "active" : "pending";
//                                     return (
//                                         <div key={s.id} style={{display: "contents"}}>
//                                             <div className={`da-step ${state}`}>
//                                                 <div className="da-dot">{state === "done" ? "✓" : s.icon}</div>
//                                                 <span className="da-lbl">{s.label}</span>
//                                             </div>
//                                             {i < STEPS.length - 1 && <div className="da-conn"/>}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//
//                             <div className="da-step-body">
//
//                                 {/* ── STEP 1: BASIC INFO ──────────────────────────────────── */}
//                                 {step === 1 && (
//                                     <>
//                                         <div style={SEC}>Account Configuration</div>
//                                         <div style={GRID3}>
//                                             <div>
//                                                 <label style={LABEL}>Account Type *</label>
//                                                 <select style={SELECT} value={basicForm.accountType}
//                                                         onChange={e => setBasicForm(p => ({
//                                                             ...p,
//                                                             accountType: e.target.value
//                                                         }))}>
//                                                     {["SAVINGS", "CURRENT", "SALARY", "NRI"].map(t => (
//                                                         <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label style={LABEL}>Branch *</label>
//                                                 <select style={SELECT} value={basicForm.branchCode}
//                                                         onChange={e => setBasicForm(p => ({
//                                                             ...p,
//                                                             branchCode: e.target.value
//                                                         }))}>
//                                                     <option value="">Select Branch</option>
//                                                     {branches.map(b => (
//                                                         <option key={b.branch_id}
//                                                                 value={b.branch_id}>{b.branch_name} — {b.city}</option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label style={LABEL}>Scheme *</label>
//                                                 <select style={SELECT} value={basicForm.schemeCode}
//                                                         onChange={e => setBasicForm(p => ({
//                                                             ...p,
//                                                             schemeCode: e.target.value
//                                                         }))}>
//                                                     <option value="">Select Scheme</option>
//                                                     {schemes.map(s => (
//                                                         <option key={s.scheme_code} value={s.scheme_code}>
//                                                             {s.scheme_name} ({s.interest_rate}%)
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                                 {selectedScheme && (
//                                                     <div style={{fontSize: ".68rem", color: "#6b7a99", marginTop: 4}}>
//                                                         Min
//                                                         Balance: {fmtAmt(selectedScheme.min_balance)} · {selectedScheme.description}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 <label style={LABEL}>Initial Deposit (₹)</label>
//                                                 <input type="number" style={INPUT} placeholder="e.g. 5000"
//                                                        value={basicForm.initialDeposit}
//                                                        onChange={e => setBasicForm(p => ({
//                                                            ...p,
//                                                            initialDeposit: e.target.value
//                                                        }))}/>
//                                             </div>
//                                         </div>
//
//                                         {/* Joint Account */}
//                                         <div style={SEC}>Joint Account</div>
//                                         <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 14}}>
//                                             <input type="checkbox" id="isJoint" checked={basicForm.isJoint}
//                                                    onChange={e => setBasicForm(p => ({
//                                                        ...p,
//                                                        isJoint: e.target.checked,
//                                                        jointCifId: "",
//                                                        jointHolderName: "",
//                                                        jointHolderPan: ""
//                                                    }))}
//                                                    style={{
//                                                        width: 16,
//                                                        height: 16,
//                                                        cursor: "pointer",
//                                                        accentColor: "#c8a96e"
//                                                    }}/>
//                                             <label htmlFor="isJoint" style={{fontSize: ".82rem", cursor: "pointer"}}>
//                                                 This is a joint account
//                                             </label>
//                                         </div>
//                                         {basicForm.isJoint && (
//                                             <>
//                                                 <div style={GRID2}>
//                                                     <div>
//                                                         <label style={LABEL}>Joint Holder CIF ID</label>
//                                                         <div style={{display: "flex", gap: 8}}>
//                                                             <input style={{...INPUT, flex: 1}}
//                                                                    placeholder="Enter CIF ID"
//                                                                    value={basicForm.jointCifId}
//                                                                    onChange={e => setBasicForm(p => ({
//                                                                        ...p,
//                                                                        jointCifId: e.target.value
//                                                                    }))}/>
//                                                             <button onClick={lookupJointCif} disabled={jointLoading}
//                                                                     style={{
//                                                                         padding: "8px 14px",
//                                                                         borderRadius: 5,
//                                                                         border: "1px solid rgba(200,169,110,.3)",
//                                                                         background: "rgba(200,169,110,.08)",
//                                                                         color: "#c8a96e",
//                                                                         cursor: "pointer",
//                                                                         fontFamily: "inherit",
//                                                                         fontSize: ".78rem",
//                                                                         fontWeight: 600,
//                                                                         whiteSpace: "nowrap"
//                                                                     }}>
//                                                                 {jointLoading ? "..." : "Lookup"}
//                                                             </button>
//                                                         </div>
//                                                         {jointError && <div style={{
//                                                             fontSize: ".7rem",
//                                                             color: "#e05c5c",
//                                                             marginTop: 4
//                                                         }}>{jointError}</div>}
//                                                     </div>
//                                                     {jointCustomer && (
//                                                         <div style={{
//                                                             padding: 12,
//                                                             background: "rgba(72,199,142,.06)",
//                                                             border: "1px solid rgba(72,199,142,.2)",
//                                                             borderRadius: 7,
//                                                             display: "flex",
//                                                             flexDirection: "column",
//                                                             gap: 4
//                                                         }}>
//                                                             <div style={{
//                                                                 fontSize: ".72rem",
//                                                                 color: "#48c78e",
//                                                                 fontWeight: 600
//                                                             }}>✓ Customer Found
//                                                             </div>
//                                                             <div style={{
//                                                                 fontSize: ".82rem",
//                                                                 fontWeight: 600
//                                                             }}>{jointCustomer.first_name} {jointCustomer.last_name}</div>
//                                                             <div style={{
//                                                                 fontSize: ".72rem",
//                                                                 color: "#8a9bb5"
//                                                             }}>{jointCustomer.mobile_no} · {jointCustomer.pan_no}</div>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 {basicForm.jointHolderName && (
//                                                     <div style={{...GRID2, marginTop: 12}}>
//                                                         <div>
//                                                             <label style={LABEL}>Joint Holder Name</label>
//                                                             <input style={INPUT} value={basicForm.jointHolderName}
//                                                                    onChange={e => setBasicForm(p => ({
//                                                                        ...p,
//                                                                        jointHolderName: e.target.value
//                                                                    }))}/>
//                                                         </div>
//                                                         <div>
//                                                             <label style={LABEL}>Joint Holder PAN</label>
//                                                             <input style={INPUT} value={basicForm.jointHolderPan}
//                                                                    onChange={e => setBasicForm(p => ({
//                                                                        ...p,
//                                                                        jointHolderPan: e.target.value
//                                                                    }))}/>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         )}
//
//                                         <div style={{
//                                             display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20,
//                                             paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
//                                         }}>
//                                             <button onClick={() => setView("list")}
//                                                     style={{
//                                                         padding: "9px 20px",
//                                                         borderRadius: 5,
//                                                         border: "1px solid rgba(255,255,255,.1)",
//                                                         background: "none",
//                                                         color: "#6b7a99",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem"
//                                                     }}>
//                                                 Cancel
//                                             </button>
//                                             <button onClick={() => {
//                                                 if (!basicForm.branchCode || !basicForm.schemeCode)
//                                                     return setError("Branch and Scheme are required.");
//                                                 nextStep();
//                                             }}
//                                                     style={{
//                                                         padding: "9px 24px",
//                                                         borderRadius: 5,
//                                                         border: "none",
//                                                         background: "linear-gradient(135deg,#c8a96e,#a07840)",
//                                                         color: "#0a1628",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem",
//                                                         fontWeight: 700
//                                                     }}>
//                                                 Next → Nominee
//                                             </button>
//                                         </div>
//                                     </>
//                                 )}
//
//                                 {/* ── STEP 2: NOMINEE ─────────────────────────────────────── */}
//                                 {step === 2 && (
//                                     <>
//                                         <div style={SEC}>Link Nominee from CIF</div>
//                                         <div style={{
//                                             marginBottom: 16,
//                                             padding: 12,
//                                             background: "rgba(255,255,255,.02)",
//                                             border: "1px solid rgba(255,255,255,.05)",
//                                             borderRadius: 7,
//                                             fontSize: ".78rem",
//                                             color: "#6b7a99"
//                                         }}>
//                                             Nominee details are pre-loaded from the customer's CIF profile.
//                                         </div>
//
//                                         {(customer?.nominees || []).length === 0 ? (
//                                             <div style={{textAlign: "center", padding: 32, color: "#6b7a99"}}>
//                                                 <div style={{fontSize: "1.5rem", marginBottom: 8}}>👥</div>
//                                                 <div>No nominee found in CIF. You can skip this step.</div>
//                                             </div>
//                                         ) : (
//                                             <div style={{display: "flex", flexDirection: "column", gap: 10}}>
//                                                 {/* No nominee option */}
//                                                 <div onClick={() => setNomineeId("")}
//                                                      style={{
//                                                          padding: 14,
//                                                          border: nomineeId === "" ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.07)",
//                                                          borderRadius: 8,
//                                                          cursor: "pointer",
//                                                          background: nomineeId === "" ? "rgba(200,169,110,.06)" : "rgba(255,255,255,.02)",
//                                                          display: "flex",
//                                                          alignItems: "center",
//                                                          gap: 12
//                                                      }}>
//                                                     <div style={{
//                                                         width: 18, height: 18, borderRadius: "50%", border: "2px solid",
//                                                         borderColor: nomineeId === "" ? "#c8a96e" : "rgba(255,255,255,.2)",
//                                                         display: "flex", alignItems: "center", justifyContent: "center"
//                                                     }}>
//                                                         {nomineeId === "" && <div style={{
//                                                             width: 8,
//                                                             height: 8,
//                                                             borderRadius: "50%",
//                                                             background: "#c8a96e"
//                                                         }}/>}
//                                                     </div>
//                                                     <span
//                                                         style={{fontSize: ".82rem", color: "#6b7a99"}}>No Nominee</span>
//                                                 </div>
//                                                 {(customer?.nominees || []).map(n => (
//                                                     <div key={n.nominee_id} onClick={() => setNomineeId(n.nominee_id)}
//                                                          style={{
//                                                              padding: 14,
//                                                              border: nomineeId === n.nominee_id ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.07)",
//                                                              borderRadius: 8,
//                                                              cursor: "pointer",
//                                                              background: nomineeId === n.nominee_id ? "rgba(200,169,110,.06)" : "rgba(255,255,255,.02)"
//                                                          }}>
//                                                         <div style={{display: "flex", alignItems: "center", gap: 12}}>
//                                                             <div style={{
//                                                                 width: 18,
//                                                                 height: 18,
//                                                                 borderRadius: "50%",
//                                                                 border: "2px solid",
//                                                                 borderColor: nomineeId === n.nominee_id ? "#c8a96e" : "rgba(255,255,255,.2)",
//                                                                 display: "flex",
//                                                                 alignItems: "center",
//                                                                 justifyContent: "center",
//                                                                 flexShrink: 0
//                                                             }}>
//                                                                 {nomineeId === n.nominee_id && <div style={{
//                                                                     width: 8,
//                                                                     height: 8,
//                                                                     borderRadius: "50%",
//                                                                     background: "#c8a96e"
//                                                                 }}/>}
//                                                             </div>
//                                                             <div>
//                                                                 <div style={{
//                                                                     fontWeight: 600,
//                                                                     fontSize: ".85rem"
//                                                                 }}>{n.nominee_name}</div>
//                                                                 <div style={{
//                                                                     fontSize: ".72rem",
//                                                                     color: "#8a9bb5",
//                                                                     marginTop: 3
//                                                                 }}>
//                                                                     {n.relation} · {n.phone || "—"} ·
//                                                                     PAN: {n.pan_number || "—"}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//
//                                         <div style={{
//                                             display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
//                                             paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
//                                         }}>
//                                             <button onClick={prevStep}
//                                                     style={{
//                                                         padding: "9px 20px",
//                                                         borderRadius: 5,
//                                                         border: "1px solid rgba(255,255,255,.1)",
//                                                         background: "none",
//                                                         color: "#6b7a99",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem"
//                                                     }}>
//                                                 ← Back
//                                             </button>
//                                             <button onClick={nextStep}
//                                                     style={{
//                                                         padding: "9px 24px",
//                                                         borderRadius: 5,
//                                                         border: "none",
//                                                         background: "linear-gradient(135deg,#c8a96e,#a07840)",
//                                                         color: "#0a1628",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem",
//                                                         fontWeight: 700
//                                                     }}>
//                                                 Next → Charges
//                                             </button>
//                                         </div>
//                                     </>
//                                 )}
//
//                                 {/* ── STEP 3: CHARGES & FACILITIES ────────────────────────── */}
//                                 {step === 3 && (
//                                     <>
//                                         <div style={SEC}>Charges & Facilities</div>
//                                         <div style={{marginBottom: 16, fontSize: ".78rem", color: "#6b7a99"}}>
//                                             Select which facilities to activate for this account. Toggle ON to enable.
//                                         </div>
//                                         <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
//                                             {FACILITIES.map(f => (
//                                                 <div key={f.id}
//                                                      className={"facility-card" + (facilities[f.id] ? " active" : "")}
//                                                      onClick={() => setFacilities(p => ({...p, [f.id]: !p[f.id]}))}>
//                                                     <div style={{display: "flex", alignItems: "center", gap: 10}}>
//                                                         <span style={{fontSize: "1.3rem"}}>{f.icon}</span>
//                                                         <div>
//                                                             <div style={{
//                                                                 fontSize: ".82rem", fontWeight: 600,
//                                                                 color: facilities[f.id] ? "#48c78e" : "#e2e8f0"
//                                                             }}>{f.label}</div>
//                                                             <div style={{
//                                                                 fontSize: ".68rem",
//                                                                 color: "#6b7a99",
//                                                                 marginTop: 2
//                                                             }}>{f.desc}</div>
//                                                         </div>
//                                                     </div>
//                                                     <button className={"toggle " + (facilities[f.id] ? "on" : "off")}
//                                                             onClick={e => {
//                                                                 e.stopPropagation();
//                                                                 setFacilities(p => ({...p, [f.id]: !p[f.id]}));
//                                                             }}/>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                         <div style={{
//                                             marginTop: 14,
//                                             padding: 12,
//                                             background: "rgba(255,255,255,.02)",
//                                             border: "1px solid rgba(255,255,255,.05)",
//                                             borderRadius: 7,
//                                             fontSize: ".75rem",
//                                             color: "#6b7a99"
//                                         }}>
//                                             ✅ Selected: <strong style={{color: "#c8a96e"}}>
//                                             {Object.values(facilities).filter(Boolean).length} facilit{Object.values(facilities).filter(Boolean).length === 1 ? "y" : "ies"}
//                                         </strong> activated
//                                         </div>
//
//                                         <div style={{
//                                             display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
//                                             paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
//                                         }}>
//                                             <button onClick={prevStep}
//                                                     style={{
//                                                         padding: "9px 20px",
//                                                         borderRadius: 5,
//                                                         border: "1px solid rgba(255,255,255,.1)",
//                                                         background: "none",
//                                                         color: "#6b7a99",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem"
//                                                     }}>
//                                                 ← Back
//                                             </button>
//                                             <button onClick={nextStep}
//                                                     style={{
//                                                         padding: "9px 24px",
//                                                         borderRadius: 5,
//                                                         border: "none",
//                                                         background: "linear-gradient(135deg,#c8a96e,#a07840)",
//                                                         color: "#0a1628",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem",
//                                                         fontWeight: 700
//                                                     }}>
//                                                 Next → Review
//                                             </button>
//                                         </div>
//                                     </>
//                                 )}
//
//                                 {/* ── STEP 4: REVIEW & CONFIRM ─────────────────────────────── */}
//                                 {step === 4 && (
//                                     <>
//                                         <div style={SEC}>Account Summary</div>
//
//                                         {/* Customer Info */}
//                                         <div style={{
//                                             marginBottom: 14, padding: 14, background: "rgba(200,169,110,.05)",
//                                             border: "1px solid rgba(200,169,110,.15)", borderRadius: 8
//                                         }}>
//                                             <div style={{
//                                                 fontSize: ".7rem",
//                                                 color: "#c8a96e",
//                                                 fontWeight: 700,
//                                                 textTransform: "uppercase",
//                                                 letterSpacing: ".06em",
//                                                 marginBottom: 10
//                                             }}>👤 Customer
//                                             </div>
//                                             <div style={{
//                                                 display: "grid",
//                                                 gridTemplateColumns: "1fr 1fr 1fr",
//                                                 gap: "8px 20px"
//                                             }}>
//                                                 {[["Name", (customer?.first_name || "") + " " + (customer?.last_name || "")],
//                                                     ["CIF ID", cifId], ["Mobile", customer?.mobile_no],
//                                                     ["PAN", customer?.pan_no], ["Branch", branches.find(b => b.branch_id === basicForm.branchCode)?.branch_name || "—"]
//                                                 ].map(([k, v]) => (
//                                                     <div key={k} className="review-row"
//                                                          style={{flexDirection: "column", gap: 2}}>
//                                                         <span className="review-key">{k}</span>
//                                                         <span className="review-val"
//                                                               style={{textAlign: "left"}}>{v || "—"}</span>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//
//                                         {/* Account Details */}
//                                         <div style={{
//                                             marginBottom: 14, padding: 14, background: "rgba(255,255,255,.02)",
//                                             border: "1px solid rgba(255,255,255,.06)", borderRadius: 8
//                                         }}>
//                                             <div style={{
//                                                 fontSize: ".7rem",
//                                                 color: "#c8a96e",
//                                                 fontWeight: 700,
//                                                 textTransform: "uppercase",
//                                                 letterSpacing: ".06em",
//                                                 marginBottom: 10
//                                             }}>🏦 Account Details
//                                             </div>
//                                             {[["Account Type", basicForm.accountType],
//                                                 ["Scheme", selectedScheme?.scheme_name || "—"],
//                                                 ["Interest Rate", (selectedScheme?.interest_rate || "—") + "%"],
//                                                 ["Initial Deposit", fmtAmt(basicForm.initialDeposit) || "₹ 0"],
//                                                 ["Joint Account", basicForm.isJoint ? "Yes — " + basicForm.jointHolderName : "No"],
//                                                 ["Nominee", nomineeId ? (customer?.nominees || []).find(n => n.nominee_id === nomineeId)?.nominee_name || "—" : "No Nominee"],
//                                             ].map(([k, v]) => (
//                                                 <div key={k} className="review-row">
//                                                     <span className="review-key">{k}</span>
//                                                     <span className="review-val">{v}</span>
//                                                 </div>
//                                             ))}
//                                         </div>
//
//                                         {/* Facilities */}
//                                         <div style={{
//                                             marginBottom: 14, padding: 14, background: "rgba(255,255,255,.02)",
//                                             border: "1px solid rgba(255,255,255,.06)", borderRadius: 8
//                                         }}>
//                                             <div style={{
//                                                 fontSize: ".7rem",
//                                                 color: "#c8a96e",
//                                                 fontWeight: 700,
//                                                 textTransform: "uppercase",
//                                                 letterSpacing: ".06em",
//                                                 marginBottom: 10
//                                             }}>💳 Facilities
//                                             </div>
//                                             <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
//                                                 {FACILITIES.map(f => (
//                                                     <span key={f.id} style={{
//                                                         padding: "3px 10px",
//                                                         borderRadius: 4,
//                                                         fontSize: ".72rem",
//                                                         fontWeight: 600,
//                                                         background: facilities[f.id] ? "rgba(72,199,142,.1)" : "rgba(255,255,255,.04)",
//                                                         border: facilities[f.id] ? "1px solid rgba(72,199,142,.3)" : "1px solid rgba(255,255,255,.06)",
//                                                         color: facilities[f.id] ? "#48c78e" : "#6b7a99"
//                                                     }}>
//                             {f.icon} {f.label}: {facilities[f.id] ? "✓ Yes" : "✗ No"}
//                           </span>
//                                                 ))}
//                                             </div>
//                                         </div>
//
//                                         {error && <div style={{
//                                             padding: "8px 12px",
//                                             borderRadius: 5,
//                                             marginBottom: 12,
//                                             background: "rgba(224,92,92,.1)",
//                                             border: "1px solid rgba(224,92,92,.3)",
//                                             color: "#e05c5c",
//                                             fontSize: ".78rem"
//                                         }}>{error}</div>}
//
//                                         <div style={{
//                                             display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
//                                             paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
//                                         }}>
//                                             <button onClick={prevStep}
//                                                     style={{
//                                                         padding: "9px 20px",
//                                                         borderRadius: 5,
//                                                         border: "1px solid rgba(255,255,255,.1)",
//                                                         background: "none",
//                                                         color: "#6b7a99",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem"
//                                                     }}>
//                                                 ← Back
//                                             </button>
//                                             <button onClick={submitAccount} disabled={submitting}
//                                                     style={{
//                                                         padding: "9px 28px",
//                                                         borderRadius: 5,
//                                                         border: "none",
//                                                         background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
//                                                         color: "#0a1628",
//                                                         cursor: "pointer",
//                                                         fontFamily: "inherit",
//                                                         fontSize: ".82rem",
//                                                         fontWeight: 700
//                                                     }}>
//                                                 {submitting ? "Submitting..." : "✓ Submit for Approval"}
//                                             </button>
//                                         </div>
//                                     </>
//                                 )}
//
//                             </div>
//                         </div>
//                     )}
//                 </div>
//
//                 {/* ── APPROVAL MODAL ──────────────────────────────────────────────── */}
//                 {selectedAcc && (
//                     <div className="da-overlay"
//                          onClick={e => e.target.className === "da-overlay" && setSelectedAcc(null)}>
//                         <div className="da-modal">
//                             <div className="da-modal-head">
//                                 <div>
//                                     <div style={{fontWeight: 700, color: "#c8a96e", fontSize: ".9rem"}}>
//                                         {TYPE_ICON[selectedAcc.account_type]} Account Review
//                                     </div>
//                                     <div style={{
//                                         fontSize: ".72rem",
//                                         color: "#6b7a99",
//                                         marginTop: 3,
//                                         fontFamily: "IBM Plex Mono,monospace"
//                                     }}>
//                                         {selectedAcc.account_number}
//                                     </div>
//                                 </div>
//                                 <button onClick={() => setSelectedAcc(null)}
//                                         style={{
//                                             background: "none",
//                                             border: "none",
//                                             color: "#6b7a99",
//                                             cursor: "pointer",
//                                             fontSize: "1.1rem"
//                                         }}>✕
//                                 </button>
//                             </div>
//                             <div className="da-modal-body">
//                                 <div style={{
//                                     display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px",
//                                     padding: 14, background: "rgba(255,255,255,.02)", borderRadius: 8,
//                                     border: "1px solid rgba(255,255,255,.06)", marginBottom: 16
//                                 }}>
//                                     {[["Account Type", selectedAcc.account_type], ["Branch", selectedAcc.branch_name],
//                                         ["Scheme", selectedAcc.scheme_name], ["Interest", selectedAcc.interest_rate + "%"],
//                                         ["Initial Deposit", fmtAmt(selectedAcc.initial_deposit)],
//                                         ["Joint", selectedAcc.is_joint ? "Yes" : "No"],
//                                         ["Created By", selectedAcc.created_by], ["Created", fmt(selectedAcc.created_date)],
//                                     ].map(([k, v]) => (
//                                         <div key={k}>
//                                             <div style={{
//                                                 fontSize: ".62rem",
//                                                 color: "#6b7a99",
//                                                 textTransform: "uppercase"
//                                             }}>{k}</div>
//                                             <div style={{fontSize: ".8rem", marginTop: 2}}>{v || "—"}</div>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div>
//                                     <label style={{...LABEL}}>Remarks</label>
//                                     <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
//                                               placeholder="Approval/rejection remarks..."
//                                               style={{...INPUT, resize: "vertical"}}/>
//                                 </div>
//                             </div>
//                             <div className="da-modal-foot">
//                                 <button onClick={() => setSelectedAcc(null)}
//                                         style={{
//                                             padding: "8px 18px",
//                                             borderRadius: 5,
//                                             border: "1px solid rgba(255,255,255,.1)",
//                                             background: "none",
//                                             color: "#6b7a99",
//                                             cursor: "pointer",
//                                             fontFamily: "inherit",
//                                             fontSize: ".82rem"
//                                         }}>
//                                     Cancel
//                                 </button>
//                                 <button onClick={() => handleStatus("REJECTED")} disabled={!!acting}
//                                         style={{
//                                             padding: "8px 20px",
//                                             borderRadius: 5,
//                                             border: "1px solid rgba(224,92,92,.3)",
//                                             background: "rgba(224,92,92,.1)",
//                                             color: "#e05c5c",
//                                             cursor: "pointer",
//                                             fontFamily: "inherit",
//                                             fontSize: ".82rem",
//                                             fontWeight: 600
//                                         }}>
//                                     {acting === "REJECTED" ? "Rejecting..." : "✕ Reject"}
//                                 </button>
//                                 <button onClick={() => handleStatus("ACTIVE")} disabled={!!acting}
//                                         style={{
//                                             padding: "8px 24px",
//                                             borderRadius: 5,
//                                             border: "none",
//                                             background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
//                                             color: "#0a1628",
//                                             cursor: "pointer",
//                                             fontFamily: "inherit",
//                                             fontSize: ".82rem",
//                                             fontWeight: 700
//                                         }}>
//                                     {acting === "ACTIVE" ? "Approving..." : "✓ Approve"}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//
//         </>
//     );
// }










import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import TopBar from "../customers/Topbar";

const BASE = "http://localhost:8080";
const tok = () => localStorage.getItem("accessToken");
const getUser = () => {
    try {
        return JSON.parse(atob(tok().split(".")[1])).sub || "";
    } catch {
        return "";
    }
};
const getRole = () => {
    try {
        return JSON.parse(atob(tok().split(".")[1])).role?.replace(/^ROLE_/i, "").toUpperCase() || "";
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
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"}) : "—";
const fmtAmt = (n) => n != null ? "₹ " + Number(n).toLocaleString("en-IN") : "—";

const STATUS_COLOR = {
    PENDING_APPROVAL: {c: "#f59e0b", bg: "rgba(245,158,11,.12)"},
    ACTIVE: {c: "#48c78e", bg: "rgba(72,199,142,.12)"},
    REJECTED: {c: "#e05c5c", bg: "rgba(224,92,92,.12)"},
    CLOSED: {c: "#6b7a99", bg: "rgba(107,122,153,.12)"},
};
const TYPE_ICON = {SAVINGS: "💰", CURRENT: "🏦", SALARY: "💼", NRI: "🌐"};

const STEPS = [
    {id: 1, label: "Basic Info", icon: "🏦"},
    {id: 2, label: "Nominee", icon: "👥"},
    {id: 3, label: "Charges", icon: "💳"},
    {id: 4, label: "Review", icon: "✅"},
];

const FACILITIES = [
    {id: "chequeBook", label: "Cheque Book", icon: "📒", desc: "Issue cheque book"},
    {id: "debitCard", label: "Debit Card", icon: "💳", desc: "ATM/Debit card"},
    {id: "internetBanking", label: "Internet Banking", icon: "🌐", desc: "Online banking access"},
    {id: "mobileBanking", label: "Mobile Banking", icon: "📱", desc: "Mobile app access"},
    {id: "smsAlerts", label: "SMS Alerts", icon: "📲", desc: "Transaction SMS alerts"},
    {id: "emailAlerts", label: "Email Alerts", icon: "📧", desc: "Transaction email alerts"},
    {id: "passbook", label: "Passbook", icon: "📔", desc: "Physical passbook"},
    {id: "lockerFacility", label: "Locker Facility", icon: "🔐", desc: "Safe deposit locker"},
];

const INPUT = {
    width: "100%", padding: "8px 12px", background: "#0e1117",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "#e2e8f0",
    fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", outline: "none"
};
const SELECT = {...INPUT, cursor: "pointer"};
const LABEL = {
    fontSize: ".63rem", color: "#6b7a99", textTransform: "uppercase",
    letterSpacing: ".04em", display: "block", marginBottom: 4
};
const GRID2 = {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px"};
const GRID3 = {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px"};
const SEC = {
    fontSize: ".63rem", fontWeight: 700, color: "#c8a96e", letterSpacing: ".08em",
    textTransform: "uppercase", borderBottom: "1px solid rgba(200,169,110,.12)",
    paddingBottom: 6, margin: "18px 0 12px",
};

export default function DemandAccountOps() {
    const {cifId} = useParams();
    const navigate = useNavigate();
    const role = getRole();
    const isManager = role === "MANAGER" || role === "ADMIN";

    const [customer, setCustomer] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ✅ FIX: detailAcc state moved INSIDE the component
    const [detailAcc, setDetailAcc] = useState(null);

    // Step 1 — Basic Info
    const [basicForm, setBasicForm] = useState({
        accountType: "SAVINGS", branchCode: "", schemeCode: "", initialDeposit: "",
        isJoint: false, jointCifId: "", jointHolderName: "", jointHolderPan: "",
    });
    const [jointCustomer, setJointCustomer] = useState(null);
    const [jointLoading, setJointLoading] = useState(false);
    const [jointError, setJointError] = useState("");

    // Step 2 — Nominee
    const [nomineeId, setNomineeId] = useState("");

    // Step 3 — Charges/Facilities
    const [facilities, setFacilities] = useState({
        chequeBook: false, debitCard: false, internetBanking: false,
        mobileBanking: false, smsAlerts: false, emailAlerts: false,
        passbook: false, lockerFacility: false,
    });

    // Manager approval modal
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [acting, setActing] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [cust, accs, brs] = await Promise.all([
                api("GET", `/api/customers/${cifId}`),
                api("GET", `/api/casa/cif/${cifId}`),
                api("GET", `/api/casa/branches`),
            ]);
            setCustomer(cust);
            setAccounts(Array.isArray(accs) ? accs : []);
            setBranches(Array.isArray(brs) ? brs : []);
            if (cust?.branch_id) setBasicForm(p => ({...p, branchCode: cust.branch_id}));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [cifId]);

    useEffect(() => {
        if (!basicForm.accountType) return;
        api("GET", `/api/casa/schemes?accountType=${basicForm.accountType}`)
            .then(data => {
                setSchemes(Array.isArray(data) ? data : []);
                setBasicForm(p => ({...p, schemeCode: ""}));
            })
            .catch(() => {});
    }, [basicForm.accountType]);

    const lookupJointCif = async () => {
        if (!basicForm.jointCifId) return;
        setJointLoading(true);
        setJointError("");
        try {
            const data = await api("GET", `/api/customers/${basicForm.jointCifId}`);
            setJointCustomer(data);
            setBasicForm(p => ({
                ...p,
                jointHolderName: (data.first_name || "") + " " + (data.last_name || ""),
                jointHolderPan: data.pan_no || ""
            }));
        } catch (e) {
            setJointError("CIF not found: " + e.message);
            setJointCustomer(null);
        } finally {
            setJointLoading(false);
        }
    };

    const submitAccount = async () => {
        if (!basicForm.branchCode || !basicForm.schemeCode)
            return setError("Branch and Scheme are required.");
        setSubmitting(true);
        setError("");
        setMsg("");
        try {
            const res = await api("POST", "/api/casa/create", {
                cifId,
                accountType: basicForm.accountType,
                branchCode: basicForm.branchCode,
                schemeCode: basicForm.schemeCode,
                initialDeposit: basicForm.initialDeposit ? parseFloat(basicForm.initialDeposit) : 0,
                nomineeId: nomineeId || "",
                isJoint: basicForm.isJoint,
                jointHolderName: basicForm.jointHolderName || "",
                jointHolderCif: basicForm.jointCifId || "",
                jointHolderPan: basicForm.jointHolderPan || "",
                facilities: facilities,
                createdBy: getUser(),
            });
            setMsg(`✓ Account created! Account Number: ${res.accountNumber}`);
            setView("list");
            setStep(1);
            load();
        } catch (e) {
            setError("⚠ " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatus = async (status) => {
        setActing(status);
        try {
            await api("PUT", `/api/casa/${selectedAcc.account_id}/status`, {
                newStatus: status, changedBy: getUser(), remarks,
            });
            setMsg(`✓ Account ${status === "ACTIVE" ? "approved" : "rejected"}!`);
            setSelectedAcc(null);
            setRemarks("");
            load();
        } catch (e) {
            setError("⚠ " + e.message);
        } finally {
            setActing(null);
        }
    };

    const nextStep = () => { setError(""); setStep(s => s + 1); };
    const prevStep = () => { setError(""); setStep(s => s - 1); };

    if (loading) return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100vh", background: "#0e1117", color: "#6b7a99",
            fontFamily: "IBM Plex Sans,sans-serif", flexDirection: "column", gap: 12
        }}>
            <div style={{fontSize: "1.5rem"}}>⏳</div>
            Loading...
        </div>
    );

    const selectedScheme = schemes.find(s => s.scheme_code === basicForm.schemeCode);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0e1117; }
        .da-root { min-height:100vh; background:#0e1117; color:#e2e8f0; font-family:'IBM Plex Sans',sans-serif; }
        .da-nav { display:flex; align-items:center; gap:12px; padding:0 24px; height:52px;
          background:#111827; border-bottom:1px solid rgba(255,255,255,.07); }
        .da-back { background:none; border:none; color:#8a9bb5; cursor:pointer; font-size:.8rem;
          padding:5px 8px; border-radius:5px; font-family:inherit; display:flex; align-items:center; gap:5px; }
        .da-back:hover { background:rgba(255,255,255,.05); color:#e2e8f0; }
        .da-back svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.5; }
        .da-body { padding:20px 24px; max-width:1100px; }
        .da-hero { padding:16px 20px; background:#161b26; border:1px solid rgba(255,255,255,.07);
          border-radius:10px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; }
        .da-card { background:#161b26; border:1px solid rgba(255,255,255,.07); border-radius:10px; overflow:hidden; }
        .da-card-head { padding:14px 18px; background:rgba(200,169,110,.04);
          border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; }
        .da-card-title { font-size:.88rem; font-weight:700; color:#c8a96e; }
        .da-stepper { display:flex; align-items:center; padding:16px 20px 0; overflow-x:auto; gap:0; }
        .da-step { display:flex; align-items:center; gap:7px; padding:7px 10px; border-radius:6px; flex-shrink:0; }
        .da-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center;
          justify-content:center; font-size:.72rem; font-weight:700; flex-shrink:0; }
        .da-step.done .da-dot    { background:rgba(72,199,142,.12); color:#48c78e; border:1.5px solid #48c78e; }
        .da-step.active .da-dot  { background:rgba(200,169,110,.18); color:#c8a96e; border:1.5px solid #c8a96e; }
        .da-step.pending .da-dot { background:rgba(255,255,255,.04); color:#6b7a99; border:1.5px solid rgba(255,255,255,.08); }
        .da-lbl { font-size:.73rem; font-weight:600; }
        .da-step.done .da-lbl    { color:#48c78e; }
        .da-step.active .da-lbl  { color:#c8a96e; }
        .da-step.pending .da-lbl { color:#6b7a99; }
        .da-conn { flex:1; height:1px; min-width:12px; background:rgba(255,255,255,.07); }
        .da-step-body { padding:20px; }
        table { width:100%; border-collapse:collapse; }
        thead th { padding:10px 14px; text-align:left; font-size:.65rem; font-weight:600;
          color:#6b7a99; letter-spacing:.06em; text-transform:uppercase;
          border-bottom:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); }
        tbody tr { border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s; }
        tbody tr:hover { background:rgba(255,255,255,.03); }
        tbody td { padding:11px 14px; font-size:.8rem; }
        .acc-no { font-family:'IBM Plex Mono',monospace; color:#c8a96e; font-size:.75rem; }
        .acc-no-link { font-family:'IBM Plex Mono',monospace; color:#c8a96e; font-size:.75rem;
          cursor:pointer; text-decoration:underline; text-decoration-style:dotted;
          text-underline-offset:3px; transition:color .15s; }
        .acc-no-link:hover { color:#e8c97e; }
        .badge  { display:inline-flex; padding:2px 8px; border-radius:3px; font-size:.68rem; font-weight:600; }
        .da-empty { padding:48px; text-align:center; color:#6b7a99; }
        .facility-card { border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:14px;
          display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:all .2s; }
        .facility-card:hover { border-color:rgba(200,169,110,.3); background:rgba(200,169,110,.04); }
        .facility-card.active { border-color:rgba(72,199,142,.4); background:rgba(72,199,142,.06); }
        .toggle { width:42px; height:22px; border-radius:11px; position:relative; cursor:pointer;
          border:none; transition:background .2s; flex-shrink:0; }
        .toggle.on  { background:#48c78e; }
        .toggle.off { background:rgba(255,255,255,.1); }
        .toggle::after { content:''; position:absolute; top:3px; width:16px; height:16px;
          border-radius:50%; background:white; transition:left .2s; }
        .toggle.on::after  { left:23px; }
        .toggle.off::after { left:3px; }
        input:focus, select:focus { border-color:rgba(200,169,110,.5) !important; outline:none; }
        .da-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200;
          display:flex; align-items:center; justify-content:center; padding:20px; }
        .da-modal { background:#161b26; border:1px solid rgba(200,169,110,.2); border-radius:10px;
          width:100%; max-width:560px; }
        .da-modal-wide { background:#161b26; border:1px solid rgba(200,169,110,.2); border-radius:10px;
          width:100%; max-width:680px; }
        .da-modal-head { padding:16px 20px; background:rgba(200,169,110,.05);
          border-bottom:1px solid rgba(255,255,255,.06);
          display:flex; align-items:center; justify-content:space-between; }
        .da-modal-body { padding:20px; max-height:70vh; overflow-y:auto; }
        .da-modal-foot { padding:14px 20px; border-top:1px solid rgba(255,255,255,.06);
          display:flex; justify-content:flex-end; gap:10px; }
        .review-row { display:flex; justify-content:space-between; padding:6px 0;
          border-bottom:1px solid rgba(255,255,255,.04); font-size:.8rem; }
        .review-key { color:#6b7a99; }
        .review-val { color:#e2e8f0; font-weight:500; text-align:right; }
        .detail-section { margin-bottom:14px; padding:14px; border-radius:8px; }
        .detail-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px 20px; }
        .detail-field { display:flex; flex-direction:column; gap:3px; }
        .detail-label { font-size:.62rem; color:#6b7a99; text-transform:uppercase; letter-spacing:.04em; }
        .detail-value { font-size:.82rem; font-weight:500; color:#e2e8f0; }
        .detail-value.mono { color:#c8a96e; font-family:'IBM Plex Mono',monospace; }
      `}</style>

            <div className="da-root">
                <TopBar breadcrumb={[
                    {label: "Customer Operations", path: "/customers"},
                    {label: cifId, path: `/customers/${cifId}`},
                    {label: "Demand Account Ops"}
                ]}/>

                <nav className="da-nav">
                    <button className="da-back" onClick={() => navigate(`/customers/${cifId}`)}>
                        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        Back
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span style={{fontFamily: "IBM Plex Mono,monospace", color: "#c8a96e", fontSize: ".85rem", fontWeight: 600}}>{cifId}</span>
                    <span style={{color: "#6b7a99", fontSize: ".8rem"}}>— Demand Account Operations</span>
                </nav>

                <div className="da-body">
                    {/* CUSTOMER HERO */}
                    {customer && (
                        <div className="da-hero">
                            <div style={{display: "flex", alignItems: "center", gap: 14}}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: "linear-gradient(135deg,#1a3a5c,#0e1117)",
                                    border: "1px solid rgba(200,169,110,.25)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".9rem", fontWeight: 700, color: "#c8a96e"
                                }}>
                                    {((customer.first_name || "?")[0] + (customer.last_name || "?")[0]).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, fontSize: ".95rem"}}>{customer.first_name} {customer.last_name}</div>
                                    <div style={{display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap"}}>
                                        <span style={{fontSize: ".72rem", color: "#8a9bb5"}}>{customer.mobile_no}</span>
                                        <span style={{fontSize: ".72rem", color: "#8a9bb5", fontFamily: "IBM Plex Mono,monospace"}}>{customer.pan_no}</span>
                                        <span style={{
                                            padding: "1px 8px", borderRadius: 3, fontSize: ".68rem", fontWeight: 600,
                                            background: "rgba(72,199,142,.1)", color: "#48c78e", border: "1px solid rgba(72,199,142,.3)"
                                        }}>{customer.cif_status}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{display: "flex", gap: 16, textAlign: "center"}}>
                                <div>
                                    <div style={{fontSize: "1.4rem", fontWeight: 700, color: "#c8a96e"}}>{accounts.length}</div>
                                    <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Total</div>
                                </div>
                                <div>
                                    <div style={{fontSize: "1.4rem", fontWeight: 700, color: "#48c78e"}}>
                                        {accounts.filter(a => a.account_status === "ACTIVE").length}
                                    </div>
                                    <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Active</div>
                                </div>
                                <div>
                                    <div style={{fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b"}}>
                                        {accounts.filter(a => a.account_status === "PENDING_APPROVAL").length}
                                    </div>
                                    <div style={{fontSize: ".68rem", color: "#6b7a99"}}>Pending</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {msg && (
                        <div style={{
                            padding: "8px 14px", borderRadius: 6, marginBottom: 14,
                            background: "rgba(72,199,142,.1)", border: "1px solid rgba(72,199,142,.3)",
                            color: "#48c78e", fontSize: ".82rem"
                        }}>{msg}</div>
                    )}
                    {error && (
                        <div style={{
                            padding: "8px 14px", borderRadius: 6, marginBottom: 14,
                            background: "rgba(224,92,92,.1)", border: "1px solid rgba(224,92,92,.3)",
                            color: "#e05c5c", fontSize: ".82rem"
                        }}>{error}</div>
                    )}

                    {/* TABS */}
                    <div style={{display: "flex", gap: 8, marginBottom: 16}}>
                        {[{id: "list", label: "Accounts", icon: "🏦"}, {id: "create", label: "Open New Account", icon: "➕"}].map(t => (
                            <button key={t.id} onClick={() => { setView(t.id); setStep(1); setError(""); setMsg(""); }}
                                style={{
                                    padding: "8px 18px", borderRadius: 6, cursor: "pointer",
                                    fontFamily: "IBM Plex Sans,sans-serif", fontSize: ".82rem", fontWeight: 600,
                                    display: "flex", alignItems: "center", gap: 8,
                                    border: view === t.id ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.08)",
                                    background: view === t.id ? "rgba(200,169,110,.1)" : "rgba(255,255,255,.03)",
                                    color: view === t.id ? "#c8a96e" : "#6b7a99"
                                }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── ACCOUNTS LIST ──────────────────────────────────────────────── */}
                    {view === "list" && (
                        <div className="da-card">
                            <div className="da-card-head">
                                <span className="da-card-title">🏦 CASA Accounts</span>
                                <span style={{fontSize: ".72rem", color: "#6b7a99"}}>{accounts.length} account(s)</span>
                            </div>
                            {accounts.length === 0 ? (
                                <div className="da-empty">
                                    <div style={{fontSize: "2rem", marginBottom: 10}}>🏦</div>
                                    <div style={{fontWeight: 600, marginBottom: 4}}>No accounts yet</div>
                                    <div style={{fontSize: ".78rem"}}>Click "Open New Account" to create a CASA account.</div>
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Account Number</th>
                                            <th>Type</th>
                                            <th>Branch</th>
                                            <th>Scheme</th>
                                            <th>Interest</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            {isManager && <th>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accounts.map(a => {
                                            const sc = STATUS_COLOR[a.account_status] || STATUS_COLOR.PENDING_APPROVAL;
                                            return (
                                                <tr key={a.account_id}>
                                                    {/* ✅ FIX: clickable account number */}
                                                    <td>
                                                        <span
                                                            className="acc-no-link"
                                                            onClick={() => setDetailAcc(a)}
                                                            title="Click to view details"
                                                        >
                                                            {a.account_number}
                                                        </span>
                                                    </td>
                                                    <td>{TYPE_ICON[a.account_type]} {a.account_type}</td>
                                                    <td style={{fontSize: ".75rem", color: "#8a9bb5"}}>{a.branch_name || "—"}</td>
                                                    <td style={{fontSize: ".75rem", color: "#8a9bb5"}}>{a.scheme_name || "—"}</td>
                                                    <td style={{color: "#c8a96e"}}>{a.interest_rate ? a.interest_rate + "%" : "—"}</td>
                                                    <td style={{fontWeight: 600}}>{fmtAmt(a.current_balance)}</td>
                                                    <td>
                                                        <span className="badge" style={{color: sc.c, background: sc.bg}}>
                                                            {a.account_status}
                                                        </span>
                                                    </td>
                                                    <td style={{fontSize: ".72rem", color: "#6b7a99"}}>{fmt(a.created_date)}</td>
                                                    {isManager && (
                                                        <td>
                                                            {a.account_status === "PENDING_APPROVAL" && (
                                                                <button
                                                                    onClick={() => { setSelectedAcc(a); setRemarks(""); }}
                                                                    style={{
                                                                        padding: "4px 12px", borderRadius: 4,
                                                                        border: "1px solid rgba(200,169,110,.3)",
                                                                        background: "rgba(200,169,110,.08)", color: "#c8a96e",
                                                                        cursor: "pointer", fontFamily: "inherit",
                                                                        fontSize: ".72rem", fontWeight: 600
                                                                    }}>
                                                                    Review
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── CREATE ACCOUNT — 4 STEP FLOW ─────────────────────────────── */}
                    {view === "create" && (
                        <div className="da-card">
                            <div className="da-card-head">
                                <span className="da-card-title">➕ Open New CASA Account</span>
                                <span style={{fontSize: ".72rem", color: "#6b7a99"}}>Step {step} of 4</span>
                            </div>

                            {/* STEPPER */}
                            <div className="da-stepper">
                                {STEPS.map((s, i) => {
                                    const state = step > s.id ? "done" : step === s.id ? "active" : "pending";
                                    return (
                                        <div key={s.id} style={{display: "contents"}}>
                                            <div className={`da-step ${state}`}>
                                                <div className="da-dot">{state === "done" ? "✓" : s.icon}</div>
                                                <span className="da-lbl">{s.label}</span>
                                            </div>
                                            {i < STEPS.length - 1 && <div className="da-conn"/>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="da-step-body">

                                {/* ── STEP 1: BASIC INFO ── */}
                                {step === 1 && (
                                    <>
                                        <div style={SEC}>Account Configuration</div>
                                        <div style={GRID3}>
                                            <div>
                                                <label style={LABEL}>Account Type *</label>
                                                <select style={SELECT} value={basicForm.accountType}
                                                    onChange={e => setBasicForm(p => ({...p, accountType: e.target.value}))}>
                                                    {["SAVINGS", "CURRENT", "SALARY", "NRI"].map(t => (
                                                        <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={LABEL}>Branch *</label>
                                                <select style={SELECT} value={basicForm.branchCode}
                                                    onChange={e => setBasicForm(p => ({...p, branchCode: e.target.value}))}>
                                                    <option value="">Select Branch</option>
                                                    {branches.map(b => (
                                                        <option key={b.branch_id} value={b.branch_id}>{b.branch_name} — {b.city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={LABEL}>Scheme *</label>
                                                <select style={SELECT} value={basicForm.schemeCode}
                                                    onChange={e => setBasicForm(p => ({...p, schemeCode: e.target.value}))}>
                                                    <option value="">Select Scheme</option>
                                                    {schemes.map(s => (
                                                        <option key={s.scheme_code} value={s.scheme_code}>
                                                            {s.scheme_name} ({s.interest_rate}%)
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedScheme && (
                                                    <div style={{fontSize: ".68rem", color: "#6b7a99", marginTop: 4}}>
                                                        Min Balance: {fmtAmt(selectedScheme.min_balance)} · {selectedScheme.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={LABEL}>Initial Deposit (₹)</label>
                                                <input type="number" style={INPUT} placeholder="e.g. 5000"
                                                    value={basicForm.initialDeposit}
                                                    onChange={e => setBasicForm(p => ({...p, initialDeposit: e.target.value}))}/>
                                            </div>
                                        </div>

                                        <div style={SEC}>Joint Account</div>
                                        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 14}}>
                                            <input type="checkbox" id="isJoint" checked={basicForm.isJoint}
                                                onChange={e => setBasicForm(p => ({
                                                    ...p, isJoint: e.target.checked,
                                                    jointCifId: "", jointHolderName: "", jointHolderPan: ""
                                                }))}
                                                style={{width: 16, height: 16, cursor: "pointer", accentColor: "#c8a96e"}}/>
                                            <label htmlFor="isJoint" style={{fontSize: ".82rem", cursor: "pointer"}}>
                                                This is a joint account
                                            </label>
                                        </div>
                                        {basicForm.isJoint && (
                                            <>
                                                <div style={GRID2}>
                                                    <div>
                                                        <label style={LABEL}>Joint Holder CIF ID</label>
                                                        <div style={{display: "flex", gap: 8}}>
                                                            <input style={{...INPUT, flex: 1}} placeholder="Enter CIF ID"
                                                                value={basicForm.jointCifId}
                                                                onChange={e => setBasicForm(p => ({...p, jointCifId: e.target.value}))}/>
                                                            <button onClick={lookupJointCif} disabled={jointLoading}
                                                                style={{
                                                                    padding: "8px 14px", borderRadius: 5,
                                                                    border: "1px solid rgba(200,169,110,.3)",
                                                                    background: "rgba(200,169,110,.08)", color: "#c8a96e",
                                                                    cursor: "pointer", fontFamily: "inherit",
                                                                    fontSize: ".78rem", fontWeight: 600, whiteSpace: "nowrap"
                                                                }}>
                                                                {jointLoading ? "..." : "Lookup"}
                                                            </button>
                                                        </div>
                                                        {jointError && <div style={{fontSize: ".7rem", color: "#e05c5c", marginTop: 4}}>{jointError}</div>}
                                                    </div>
                                                    {jointCustomer && (
                                                        <div style={{
                                                            padding: 12, background: "rgba(72,199,142,.06)",
                                                            border: "1px solid rgba(72,199,142,.2)", borderRadius: 7,
                                                            display: "flex", flexDirection: "column", gap: 4
                                                        }}>
                                                            <div style={{fontSize: ".72rem", color: "#48c78e", fontWeight: 600}}>✓ Customer Found</div>
                                                            <div style={{fontSize: ".82rem", fontWeight: 600}}>{jointCustomer.first_name} {jointCustomer.last_name}</div>
                                                            <div style={{fontSize: ".72rem", color: "#8a9bb5"}}>{jointCustomer.mobile_no} · {jointCustomer.pan_no}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                {basicForm.jointHolderName && (
                                                    <div style={{...GRID2, marginTop: 12}}>
                                                        <div>
                                                            <label style={LABEL}>Joint Holder Name</label>
                                                            <input style={INPUT} value={basicForm.jointHolderName}
                                                                onChange={e => setBasicForm(p => ({...p, jointHolderName: e.target.value}))}/>
                                                        </div>
                                                        <div>
                                                            <label style={LABEL}>Joint Holder PAN</label>
                                                            <input style={INPUT} value={basicForm.jointHolderPan}
                                                                onChange={e => setBasicForm(p => ({...p, jointHolderPan: e.target.value}))}/>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div style={{
                                            display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20,
                                            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
                                        }}>
                                            <button onClick={() => setView("list")}
                                                style={{
                                                    padding: "9px 20px", borderRadius: 5,
                                                    border: "1px solid rgba(255,255,255,.1)", background: "none",
                                                    color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                                }}>
                                                Cancel
                                            </button>
                                            <button onClick={() => {
                                                if (!basicForm.branchCode || !basicForm.schemeCode)
                                                    return setError("Branch and Scheme are required.");
                                                nextStep();
                                            }}
                                                style={{
                                                    padding: "9px 24px", borderRadius: 5, border: "none",
                                                    background: "linear-gradient(135deg,#c8a96e,#a07840)",
                                                    color: "#0a1628", cursor: "pointer", fontFamily: "inherit",
                                                    fontSize: ".82rem", fontWeight: 700
                                                }}>
                                                Next → Nominee
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* ── STEP 2: NOMINEE ── */}
                                {step === 2 && (
                                    <>
                                        <div style={SEC}>Link Nominee from CIF</div>
                                        <div style={{
                                            marginBottom: 16, padding: 12, background: "rgba(255,255,255,.02)",
                                            border: "1px solid rgba(255,255,255,.05)", borderRadius: 7,
                                            fontSize: ".78rem", color: "#6b7a99"
                                        }}>
                                            Nominee details are pre-loaded from the customer's CIF profile.
                                        </div>

                                        {(customer?.nominees || []).length === 0 ? (
                                            <div style={{textAlign: "center", padding: 32, color: "#6b7a99"}}>
                                                <div style={{fontSize: "1.5rem", marginBottom: 8}}>👥</div>
                                                <div>No nominee found in CIF. You can skip this step.</div>
                                            </div>
                                        ) : (
                                            <div style={{display: "flex", flexDirection: "column", gap: 10}}>
                                                <div onClick={() => setNomineeId("")}
                                                    style={{
                                                        padding: 14,
                                                        border: nomineeId === "" ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.07)",
                                                        borderRadius: 8, cursor: "pointer",
                                                        background: nomineeId === "" ? "rgba(200,169,110,.06)" : "rgba(255,255,255,.02)",
                                                        display: "flex", alignItems: "center", gap: 12
                                                    }}>
                                                    <div style={{
                                                        width: 18, height: 18, borderRadius: "50%", border: "2px solid",
                                                        borderColor: nomineeId === "" ? "#c8a96e" : "rgba(255,255,255,.2)",
                                                        display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}>
                                                        {nomineeId === "" && <div style={{width: 8, height: 8, borderRadius: "50%", background: "#c8a96e"}}/>}
                                                    </div>
                                                    <span style={{fontSize: ".82rem", color: "#6b7a99"}}>No Nominee</span>
                                                </div>
                                                {(customer?.nominees || []).map(n => (
                                                    <div key={n.nominee_id} onClick={() => setNomineeId(n.nominee_id)}
                                                        style={{
                                                            padding: 14,
                                                            border: nomineeId === n.nominee_id ? "1px solid rgba(200,169,110,.4)" : "1px solid rgba(255,255,255,.07)",
                                                            borderRadius: 8, cursor: "pointer",
                                                            background: nomineeId === n.nominee_id ? "rgba(200,169,110,.06)" : "rgba(255,255,255,.02)"
                                                        }}>
                                                        <div style={{display: "flex", alignItems: "center", gap: 12}}>
                                                            <div style={{
                                                                width: 18, height: 18, borderRadius: "50%", border: "2px solid",
                                                                borderColor: nomineeId === n.nominee_id ? "#c8a96e" : "rgba(255,255,255,.2)",
                                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                            }}>
                                                                {nomineeId === n.nominee_id && <div style={{width: 8, height: 8, borderRadius: "50%", background: "#c8a96e"}}/>}
                                                            </div>
                                                            <div>
                                                                <div style={{fontWeight: 600, fontSize: ".85rem"}}>{n.nominee_name}</div>
                                                                <div style={{fontSize: ".72rem", color: "#8a9bb5", marginTop: 3}}>
                                                                    {n.relation} · {n.phone || "—"} · PAN: {n.pan_number || "—"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{
                                            display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
                                            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
                                        }}>
                                            <button onClick={prevStep}
                                                style={{
                                                    padding: "9px 20px", borderRadius: 5,
                                                    border: "1px solid rgba(255,255,255,.1)", background: "none",
                                                    color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                                }}>← Back</button>
                                            <button onClick={nextStep}
                                                style={{
                                                    padding: "9px 24px", borderRadius: 5, border: "none",
                                                    background: "linear-gradient(135deg,#c8a96e,#a07840)",
                                                    color: "#0a1628", cursor: "pointer", fontFamily: "inherit",
                                                    fontSize: ".82rem", fontWeight: 700
                                                }}>Next → Charges</button>
                                        </div>
                                    </>
                                )}

                                {/* ── STEP 3: CHARGES & FACILITIES ── */}
                                {step === 3 && (
                                    <>
                                        <div style={SEC}>Charges & Facilities</div>
                                        <div style={{marginBottom: 16, fontSize: ".78rem", color: "#6b7a99"}}>
                                            Select which facilities to activate for this account. Toggle ON to enable.
                                        </div>
                                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                                            {FACILITIES.map(f => (
                                                <div key={f.id}
                                                    className={"facility-card" + (facilities[f.id] ? " active" : "")}
                                                    onClick={() => setFacilities(p => ({...p, [f.id]: !p[f.id]}))}>
                                                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                                                        <span style={{fontSize: "1.3rem"}}>{f.icon}</span>
                                                        <div>
                                                            <div style={{
                                                                fontSize: ".82rem", fontWeight: 600,
                                                                color: facilities[f.id] ? "#48c78e" : "#e2e8f0"
                                                            }}>{f.label}</div>
                                                            <div style={{fontSize: ".68rem", color: "#6b7a99", marginTop: 2}}>{f.desc}</div>
                                                        </div>
                                                    </div>
                                                    <button className={"toggle " + (facilities[f.id] ? "on" : "off")}
                                                        onClick={e => { e.stopPropagation(); setFacilities(p => ({...p, [f.id]: !p[f.id]})); }}/>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{
                                            marginTop: 14, padding: 12, background: "rgba(255,255,255,.02)",
                                            border: "1px solid rgba(255,255,255,.05)", borderRadius: 7,
                                            fontSize: ".75rem", color: "#6b7a99"
                                        }}>
                                            ✅ Selected: <strong style={{color: "#c8a96e"}}>
                                                {Object.values(facilities).filter(Boolean).length} facilit{Object.values(facilities).filter(Boolean).length === 1 ? "y" : "ies"}
                                            </strong> activated
                                        </div>

                                        <div style={{
                                            display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
                                            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
                                        }}>
                                            <button onClick={prevStep}
                                                style={{
                                                    padding: "9px 20px", borderRadius: 5,
                                                    border: "1px solid rgba(255,255,255,.1)", background: "none",
                                                    color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                                }}>← Back</button>
                                            <button onClick={nextStep}
                                                style={{
                                                    padding: "9px 24px", borderRadius: 5, border: "none",
                                                    background: "linear-gradient(135deg,#c8a96e,#a07840)",
                                                    color: "#0a1628", cursor: "pointer", fontFamily: "inherit",
                                                    fontSize: ".82rem", fontWeight: 700
                                                }}>Next → Review</button>
                                        </div>
                                    </>
                                )}

                                {/* ── STEP 4: REVIEW & CONFIRM ── */}
                                {step === 4 && (
                                    <>
                                        <div style={SEC}>Account Summary</div>

                                        <div style={{
                                            marginBottom: 14, padding: 14, background: "rgba(200,169,110,.05)",
                                            border: "1px solid rgba(200,169,110,.15)", borderRadius: 8
                                        }}>
                                            <div style={{
                                                fontSize: ".7rem", color: "#c8a96e", fontWeight: 700,
                                                textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10
                                            }}>👤 Customer</div>
                                            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 20px"}}>
                                                {[
                                                    ["Name", (customer?.first_name || "") + " " + (customer?.last_name || "")],
                                                    ["CIF ID", cifId],
                                                    ["Mobile", customer?.mobile_no],
                                                    ["PAN", customer?.pan_no],
                                                    ["Branch", branches.find(b => b.branch_id === basicForm.branchCode)?.branch_name || "—"]
                                                ].map(([k, v]) => (
                                                    <div key={k} className="review-row" style={{flexDirection: "column", gap: 2}}>
                                                        <span className="review-key">{k}</span>
                                                        <span className="review-val" style={{textAlign: "left"}}>{v || "—"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{
                                            marginBottom: 14, padding: 14, background: "rgba(255,255,255,.02)",
                                            border: "1px solid rgba(255,255,255,.06)", borderRadius: 8
                                        }}>
                                            <div style={{
                                                fontSize: ".7rem", color: "#c8a96e", fontWeight: 700,
                                                textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10
                                            }}>🏦 Account Details</div>
                                            {[
                                                ["Account Type", basicForm.accountType],
                                                ["Scheme", selectedScheme?.scheme_name || "—"],
                                                ["Interest Rate", (selectedScheme?.interest_rate || "—") + "%"],
                                                ["Initial Deposit", fmtAmt(basicForm.initialDeposit) || "₹ 0"],
                                                ["Joint Account", basicForm.isJoint ? "Yes — " + basicForm.jointHolderName : "No"],
                                                ["Nominee", nomineeId ? (customer?.nominees || []).find(n => n.nominee_id === nomineeId)?.nominee_name || "—" : "No Nominee"],
                                            ].map(([k, v]) => (
                                                <div key={k} className="review-row">
                                                    <span className="review-key">{k}</span>
                                                    <span className="review-val">{v}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{
                                            marginBottom: 14, padding: 14, background: "rgba(255,255,255,.02)",
                                            border: "1px solid rgba(255,255,255,.06)", borderRadius: 8
                                        }}>
                                            <div style={{
                                                fontSize: ".7rem", color: "#c8a96e", fontWeight: 700,
                                                textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10
                                            }}>💳 Facilities</div>
                                            <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                                                {FACILITIES.map(f => (
                                                    <span key={f.id} style={{
                                                        padding: "3px 10px", borderRadius: 4, fontSize: ".72rem", fontWeight: 600,
                                                        background: facilities[f.id] ? "rgba(72,199,142,.1)" : "rgba(255,255,255,.04)",
                                                        border: facilities[f.id] ? "1px solid rgba(72,199,142,.3)" : "1px solid rgba(255,255,255,.06)",
                                                        color: facilities[f.id] ? "#48c78e" : "#6b7a99"
                                                    }}>
                                                        {f.icon} {f.label}: {facilities[f.id] ? "✓ Yes" : "✗ No"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {error && (
                                            <div style={{
                                                padding: "8px 12px", borderRadius: 5, marginBottom: 12,
                                                background: "rgba(224,92,92,.1)", border: "1px solid rgba(224,92,92,.3)",
                                                color: "#e05c5c", fontSize: ".78rem"
                                            }}>{error}</div>
                                        )}

                                        <div style={{
                                            display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20,
                                            paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)"
                                        }}>
                                            <button onClick={prevStep}
                                                style={{
                                                    padding: "9px 20px", borderRadius: 5,
                                                    border: "1px solid rgba(255,255,255,.1)", background: "none",
                                                    color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                                }}>← Back</button>
                                            <button onClick={submitAccount} disabled={submitting}
                                                style={{
                                                    padding: "9px 28px", borderRadius: 5, border: "none",
                                                    background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
                                                    color: "#0a1628", cursor: "pointer", fontFamily: "inherit",
                                                    fontSize: ".82rem", fontWeight: 700
                                                }}>
                                                {submitting ? "Submitting..." : "✓ Submit for Approval"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── ACCOUNT DETAIL MODAL ─────────────────────────────────────────── */}
                {detailAcc && (
                    <div className="da-overlay" onClick={e => e.target.className === "da-overlay" && setDetailAcc(null)}>
                        <div className="da-modal-wide">
                            <div className="da-modal-head">
                                <div>
                                    <div style={{fontWeight: 700, color: "#c8a96e", fontSize: ".9rem"}}>
                                        {TYPE_ICON[detailAcc.account_type]} Account Details
                                    </div>
                                    <div style={{fontSize: ".72rem", color: "#6b7a99", marginTop: 3, fontFamily: "IBM Plex Mono,monospace"}}>
                                        {detailAcc.account_number}
                                    </div>
                                </div>
                                <button onClick={() => setDetailAcc(null)}
                                    style={{background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: "1.1rem"}}>✕
                                </button>
                            </div>

                            <div className="da-modal-body">

                                {/* Status */}
                                <div style={{display: "flex", justifyContent: "center", marginBottom: 16}}>
                                    {(() => {
                                        const sc = STATUS_COLOR[detailAcc.account_status] || STATUS_COLOR.PENDING_APPROVAL;
                                        return (
                                            <span style={{
                                                padding: "4px 18px", borderRadius: 4, fontSize: ".78rem", fontWeight: 700,
                                                color: sc.c, background: sc.bg, border: `1px solid ${sc.c}55`
                                            }}>{detailAcc.account_status}</span>
                                        );
                                    })()}
                                </div>

                                {/* Account Info */}
                                <div className="detail-section" style={{background: "rgba(200,169,110,.05)", border: "1px solid rgba(200,169,110,.15)"}}>
                                    <div style={{fontSize: ".7rem", color: "#c8a96e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12}}>
                                        🏦 Account Info
                                    </div>
                                    <div className="detail-grid">
                                        {[
                                            ["Account Number", detailAcc.account_number, true],
                                            ["Account Type",   detailAcc.account_type,   false],
                                            ["Branch",         detailAcc.branch_name,     false],
                                            ["Scheme",         detailAcc.scheme_name,     false],
                                            ["Interest Rate",  detailAcc.interest_rate ? detailAcc.interest_rate + "%" : "—", false],
                                            ["Current Balance",fmtAmt(detailAcc.current_balance), false],
                                            ["Initial Deposit",fmtAmt(detailAcc.initial_deposit), false],
                                            ["Created Date",   fmt(detailAcc.created_date), false],
                                            ["Created By",     detailAcc.created_by,      false],
                                        ].map(([k, v, mono]) => (
                                            <div key={k} className="detail-field">
                                                <span className="detail-label">{k}</span>
                                                <span className={`detail-value${mono ? " mono" : ""}`}>{v || "—"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Joint Account */}
                                {detailAcc.is_joint && (
                                    <div className="detail-section" style={{background: "rgba(167,139,250,.05)", border: "1px solid rgba(167,139,250,.2)"}}>
                                        <div style={{fontSize: ".7rem", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12}}>
                                            👥 Joint Account Holder
                                        </div>
                                        <div className="detail-grid">
                                            {[
                                                ["Name", detailAcc.joint_holder_name],
                                                ["CIF ID", detailAcc.joint_holder_cif],
                                                ["PAN", detailAcc.joint_holder_pan],
                                            ].map(([k, v]) => (
                                                <div key={k} className="detail-field">
                                                    <span className="detail-label">{k}</span>
                                                    <span className="detail-value">{v || "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nominee */}
                                <div className="detail-section" style={{background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)"}}>
                                    <div style={{fontSize: ".7rem", color: "#c8a96e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10}}>
                                        👤 Nominee
                                    </div>
                                    {detailAcc.nominee_id ? (
                                        <div className="detail-grid">
                                            {(() => {
                                                const nom = (customer?.nominees || []).find(n => n.nominee_id === detailAcc.nominee_id);
                                                return nom ? [
                                                    ["Name",     nom.nominee_name],
                                                    ["Relation", nom.relation],
                                                    ["Phone",    nom.phone],
                                                    ["PAN",      nom.pan_number],
                                                ].map(([k, v]) => (
                                                    <div key={k} className="detail-field">
                                                        <span className="detail-label">{k}</span>
                                                        <span className="detail-value">{v || "—"}</span>
                                                    </div>
                                                )) : (
                                                    <span style={{fontSize: ".82rem", color: "#6b7a99"}}>Nominee ID: {detailAcc.nominee_id}</span>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <span style={{fontSize: ".82rem", color: "#6b7a99"}}>No Nominee Linked</span>
                                    )}
                                </div>

                                {/* Facilities */}
                                <div className="detail-section" style={{background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)"}}>
                                    <div style={{fontSize: ".7rem", color: "#c8a96e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10}}>
                                        💳 Facilities
                                    </div>
                                    <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                                        {FACILITIES.map(f => {
                                            const active = detailAcc.facilities?.[f.id];
                                            return (
                                                <span key={f.id} style={{
                                                    padding: "4px 12px", borderRadius: 4, fontSize: ".72rem", fontWeight: 600,
                                                    background: active ? "rgba(72,199,142,.1)" : "rgba(255,255,255,.04)",
                                                    border: active ? "1px solid rgba(72,199,142,.3)" : "1px solid rgba(255,255,255,.06)",
                                                    color: active ? "#48c78e" : "#6b7a99"
                                                }}>
                                                    {f.icon} {f.label} {active ? "✓" : "✗"}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="da-modal-foot">
                                <button onClick={() => setDetailAcc(null)}
                                    style={{
                                        padding: "8px 24px", borderRadius: 5,
                                        border: "1px solid rgba(255,255,255,.1)", background: "none",
                                        color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                    }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── APPROVAL MODAL ──────────────────────────────────────────────── */}
                {selectedAcc && (
                    <div className="da-overlay" onClick={e => e.target.className === "da-overlay" && setSelectedAcc(null)}>
                        <div className="da-modal">
                            <div className="da-modal-head">
                                <div>
                                    <div style={{fontWeight: 700, color: "#c8a96e", fontSize: ".9rem"}}>
                                        {TYPE_ICON[selectedAcc.account_type]} Account Review
                                    </div>
                                    <div style={{fontSize: ".72rem", color: "#6b7a99", marginTop: 3, fontFamily: "IBM Plex Mono,monospace"}}>
                                        {selectedAcc.account_number}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAcc(null)}
                                    style={{background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: "1.1rem"}}>✕
                                </button>
                            </div>
                            <div className="da-modal-body">
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px",
                                    padding: 14, background: "rgba(255,255,255,.02)", borderRadius: 8,
                                    border: "1px solid rgba(255,255,255,.06)", marginBottom: 16
                                }}>
                                    {[
                                        ["Account Type",    selectedAcc.account_type],
                                        ["Branch",          selectedAcc.branch_name],
                                        ["Scheme",          selectedAcc.scheme_name],
                                        ["Interest",        selectedAcc.interest_rate + "%"],
                                        ["Initial Deposit", fmtAmt(selectedAcc.initial_deposit)],
                                        ["Joint",           selectedAcc.is_joint ? "Yes" : "No"],
                                        ["Created By",      selectedAcc.created_by],
                                        ["Created",         fmt(selectedAcc.created_date)],
                                    ].map(([k, v]) => (
                                        <div key={k}>
                                            <div style={{fontSize: ".62rem", color: "#6b7a99", textTransform: "uppercase"}}>{k}</div>
                                            <div style={{fontSize: ".8rem", marginTop: 2}}>{v || "—"}</div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label style={{...LABEL}}>Remarks</label>
                                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                                        placeholder="Approval/rejection remarks..."
                                        style={{...INPUT, resize: "vertical"}}/>
                                </div>
                            </div>
                            <div className="da-modal-foot">
                                <button onClick={() => setSelectedAcc(null)}
                                    style={{
                                        padding: "8px 18px", borderRadius: 5,
                                        border: "1px solid rgba(255,255,255,.1)", background: "none",
                                        color: "#6b7a99", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem"
                                    }}>Cancel</button>
                                <button onClick={() => handleStatus("REJECTED")} disabled={!!acting}
                                    style={{
                                        padding: "8px 20px", borderRadius: 5,
                                        border: "1px solid rgba(224,92,92,.3)", background: "rgba(224,92,92,.1)",
                                        color: "#e05c5c", cursor: "pointer", fontFamily: "inherit",
                                        fontSize: ".82rem", fontWeight: 600
                                    }}>
                                    {acting === "REJECTED" ? "Rejecting..." : "✕ Reject"}
                                </button>
                                <button onClick={() => handleStatus("ACTIVE")} disabled={!!acting}
                                    style={{
                                        padding: "8px 24px", borderRadius: 5, border: "none",
                                        background: "linear-gradient(135deg,#48c78e,#2d9e6e)",
                                        color: "#0a1628", cursor: "pointer", fontFamily: "inherit",
                                        fontSize: ".82rem", fontWeight: 700
                                    }}>
                                    {acting === "ACTIVE" ? "Approving..." : "✓ Approve"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}