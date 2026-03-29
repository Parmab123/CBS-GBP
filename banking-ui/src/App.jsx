import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CustomerOps from "./component/customers/CustomerOps";
import CustomerOnboarding from "./component/customers/CustomerOnboarding";
import PendingApprovals from "./component/customers/manager/PendingApprovals";
import AllDrafts from "./component/customers/AllDrafts";
import CustomerDetail from "./component/customers/customerOperation/CustomerDetail";
import ModificationRequest from "./component/customers/customerOperation/Modificationrequest";
import ModificationApproval from "./component/customers/customerOperation/Modificationapproval";
import DemandAccountOps from "./component/casa/Demandaccountops.jsx";

// ── Placeholder pages ─────────────────────────────────────────────────────────
const Placeholder = ({title}) => (
    <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh",
        background: "#0e1117", color: "#c8a96e", fontFamily: "IBM Plex Sans, sans-serif"
    }}>
        <div style={{fontSize: "2rem", marginBottom: 12}}>🚧</div>
        <div style={{fontSize: "1.2rem", fontWeight: 600}}>{title}</div>
        <div style={{color: "#6b7a99", marginTop: 8, fontSize: ".85rem"}}>Coming soon</div>
        <button
            onClick={() => window.history.back()}
            style={{
                marginTop: 24, padding: "8px 20px", borderRadius: 6,
                background: "rgba(200,169,110,.1)", border: "1px solid rgba(200,169,110,.3)",
                color: "#c8a96e", cursor: "pointer", fontSize: ".85rem"
            }}
        >← Go Back
        </button>
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ── Public ─────────────────────────────────────── */}
                <Route path="/login" element={<Login/>}/>

                {/* ── Dashboard ──────────────────────────────────── */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard/></ProtectedRoute>
                }/>

                {/* ── Customer Ops ────────────────────────────────── */}
                <Route path="/customers" element={
                    <ProtectedRoute><CustomerOps/></ProtectedRoute>
                }/>
                <Route path="/customers/all" element={
                    <ProtectedRoute><CustomerOps/></ProtectedRoute>
                }/>
                <Route path="/customers/create" element={
                    <ProtectedRoute><CustomerOnboarding/></ProtectedRoute>
                }/>

                {/* ── All Drafts ──────────────────────────────────── */}
                <Route path="/drafts" element={
                    <ProtectedRoute><AllDrafts/></ProtectedRoute>
                }/>

                {/* ── Pending Approvals — Manager & Admin ─────────── */}
                <Route path="/customers/manager/pending" element={
                    <ProtectedRoute><PendingApprovals/></ProtectedRoute>
                }/>

                {/* ── Other modules ───────────────────────────────── */}
                <Route path="/kyc" element={
                    <ProtectedRoute><Placeholder title="KYC Operations"/></ProtectedRoute>
                }/>
                <Route path="/followup" element={
                    <ProtectedRoute><Placeholder title="Follow-Up Management"/></ProtectedRoute>
                }/>
                <Route path="/signature" element={
                    <ProtectedRoute><Placeholder title="Signature Management"/></ProtectedRoute>
                }/>

                {/* ── Customer detail ─────────────────────────────── */}
                <Route path="/customers/:cifId" element={
                    <ProtectedRoute><CustomerDetail/></ProtectedRoute>
                }/>

                {/*<Route path="/customers/:cifId/modify" element={*/}
                {/*    <ProtectedRoute><ModificationRequest/></ProtectedRoute>*/}
                {/*}/>*/}
                {/*<Route path="/modifications/pending" element={*/}
                {/*    <ProtectedRoute><ModificationApproval/></ProtectedRoute>*/}
                {/*}/>*/}

                <Route path="/customers/:cifId/modify" element={
                    <ProtectedRoute><ModificationRequest/></ProtectedRoute>
                }/>
                <Route path="/modifications/pending" element={
                    <ProtectedRoute><ModificationApproval/></ProtectedRoute>
                }/>
                <Route path="/customers/:cifId/demand-account" element={
                    <ProtectedRoute><DemandAccountOps/></ProtectedRoute>
                }/>
                {/* ── Catch-all — MUST BE LAST ────────────────────── */}
                <Route path="*" element={<Navigate to="/login" replace/>}/>

            </Routes>
        </BrowserRouter>
    );
}