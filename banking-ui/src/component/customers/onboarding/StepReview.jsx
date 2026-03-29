// Final review step — shows all collected data and submits
import {useState} from "react";
import {alert, btnPrimary, btnSecondary} from "./onboardingStyles";

export default function StepReview({cifId, draft, basicExt, address, kyc, risk, sig, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const handle = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/submit`, {
                method: "PUT",
                headers: {Authorization: "Bearer " + localStorage.getItem("accessToken")},
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed");
            setDone(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (done) return (
        <div style={{textAlign: "center", padding: "32px 0"}}>
            <div style={{fontSize: "2.5rem", marginBottom: 12}}>🎉</div>
            <div style={{fontSize: "1.1rem", fontWeight: 700, color: "#48c78e", marginBottom: 8}}>
                Successfully Submitted!
            </div>
            <div style={{fontSize: ".82rem", color: "#8a9bb5", marginBottom: 6}}>
                CIF <span style={{color: "#c8a96e", fontFamily: "IBM Plex Mono, monospace"}}>{cifId}</span> is now under
                manager review.
            </div>
            <a href="/customers" style={{
                display: "inline-block", marginTop: 20, padding: "8px 24px",
                borderRadius: 5, background: "linear-gradient(135deg,#c8a96e,#a8894e)",
                color: "#0e1117", fontWeight: 700, textDecoration: "none", fontSize: ".82rem"
            }}>← Back to Customers</a>
        </div>
    );

    const Row = ({label, value}) => (
        <div style={{display: "flex", flexDirection: "column", gap: 2}}>
            <span style={{
                fontSize: ".63rem",
                color: "#6b7a99",
                textTransform: "uppercase",
                letterSpacing: ".04em"
            }}>{label}</span>
            <span style={{
                fontSize: ".8rem",
                color: value ? "#e2e8f0" : "#4a5568",
                fontStyle: value ? "normal" : "italic"
            }}>
        {value || "—"}
      </span>
        </div>
    );

    const Section = ({icon, title, children}) => (
        <div style={{marginBottom: 16}}>
            <div style={{
                fontSize: ".68rem", fontWeight: 700, color: "#c8a96e",
                letterSpacing: ".07em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(200,169,110,.15)", paddingBottom: 5, marginBottom: 10
            }}>{icon} {title}</div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px"}}>
                {children}
            </div>
        </div>
    );

    const fullName = [draft.firstName, basicExt?.middleName, draft.lastName].filter(Boolean).join(" ");

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            <div style={{
                background: "rgba(200,169,110,.06)", border: "1px solid rgba(200,169,110,.2)",
                borderRadius: 6, padding: "10px 14px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 10
            }}>
                <span style={{fontSize: "1.1rem"}}>📋</span>
                <div>
                    <div style={{fontSize: ".82rem", fontWeight: 600, color: "#c8a96e"}}>
                        CIF ID: <span style={{fontFamily: "IBM Plex Mono, monospace"}}>{cifId}</span>
                    </div>
                    <div style={{fontSize: ".72rem", color: "#8a9bb5", marginTop: 2}}>
                        Review all details carefully before submitting for approval.
                    </div>
                </div>
            </div>

            <Section icon="👤" title="Basic Info">
                <Row label="Full Name" value={fullName}/>
                <Row label="DOB" value={draft.dob}/>
                <Row label="Mobile" value={draft.mobileNo}/>
                <Row label="Email" value={draft.email}/>
                <Row label="PAN" value={draft.panNo}/>
                <Row label="Aadhaar" value={basicExt?.aadharNo}/>
                <Row label="Gender" value={basicExt?.gender}/>
                <Row label="Occupation" value={basicExt?.occupation}/>
                <Row label="Created By" value={draft.createdBy}/>
            </Section>

            <Section icon="🏠" title="Address">
                <Row label="Type" value={address?.addressType}/>
                <Row label="Line 1" value={address?.addressLine1}/>
                <Row label="Line 2" value={address?.addressLine2}/>
                <Row label="City" value={address?.city}/>
                <Row label="State" value={address?.state}/>
                <Row label="Pincode" value={address?.postalCode}/>
                <Row label="Country" value={address?.country}/>
            </Section>

            <Section icon="🪪" title="KYC">
                <Row label="KYC Type" value={kyc?.kycType}/>
                <Row label="PAN Number" value={kyc?.panNumber}/>
                <Row label="Aadhaar" value={kyc?.aadhaarNumber}/>
                <Row label="Issued By" value={kyc?.issuedBy}/>
                <Row label="Issue Date" value={kyc?.issueDate}/>
                <Row label="Expiry Date" value={kyc?.expiryDate}/>
            </Section>

            <Section icon="⚠️" title="Risk Profile">
                <Row label="Category" value={risk?.riskCategory}/>
                <Row label="Income Range" value={risk?.incomeRange}/>
                <Row label="Occupation" value={risk?.occupation}/>
                <Row label="PEP Flag" value={risk?.politicallyExposedPerson ? "Yes ⚠️" : "No"}/>
            </Section>

            <Section icon="✍️" title="Signature">
                <Row label="Type" value={sig?.signatureType}/>
                {sig?.signatureData && (
                    <div style={{gridColumn: "1 / -1"}}>
                        <img src={sig.signatureData} alt="Signature"
                             style={{
                                 maxHeight: 80,
                                 border: "1px solid rgba(255,255,255,.1)",
                                 borderRadius: 4,
                                 marginTop: 4
                             }}/>
                    </div>
                )}
            </Section>

            <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16}}>
                <button style={btnSecondary} onClick={onBack}>← Back</button>
                <button
                    onClick={handle} disabled={loading}
                    style={{
                        ...btnPrimary,
                        background: "linear-gradient(135deg,#48c78e,#2ea870)",
                        color: "#fff",
                    }}>
                    {loading ? "Submitting..." : "🚀 Submit for Approval"}
                </button>
            </div>
        </div>
    );
}