// KycRequest: panNumber, aadhaarNumber, kycType
import {useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid2, labelStyle, sectionTitle} from "./onboardingStyles";

const KYC_TYPES = ["Aadhaar", "PAN", "Passport", "Driving Licence", "Voter ID", "NREGA Card"];

export default function StepKyc({cifId, draft, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        kycType: "",
        panNumber: draft.panNo || "",   // pre-fill from draft
        aadhaarNumber: "",
        // extra UI fields (not sent to backend)
        issueDate: "", expiryDate: "", issuedBy: "",
    });
    const f = (field) => (val) => setForm(p => ({...p, [field]: val}));

    const handle = async () => {
        if (!form.kycType) return setError("KYC type is required.");
        if (!form.panNumber && !form.aadhaarNumber) return setError("At least PAN or Aadhaar number is required.");
        setLoading(true);
        setError("");
        try {
            // Exact KycRequest fields only
            const payload = {
                kycType: form.kycType,
                panNumber: form.panNumber,
                aadhaarNumber: form.aadhaarNumber,
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/kyc`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed");
            onSuccess(form);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            <div style={sectionTitle}>KYC Document</div>
            <div style={grid2}>
                <Field label="KYC Type *">
                    <Select value={form.kycType} onChange={f("kycType")} options={KYC_TYPES}/>
                </Field>
                <Field label="PAN Number">
                    <Input value={form.panNumber} onChange={f("panNumber")} placeholder="ABCDE1234F"/>
                </Field>
                <Field label="Aadhaar Number">
                    <Input value={form.aadhaarNumber} onChange={f("aadhaarNumber")} placeholder="12-digit Aadhaar"/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Additional Details (Reference Only)</div>
            <div style={grid2}>
                <Field label="Issue Date"><Input type="date" value={form.issueDate} onChange={f("issueDate")}/></Field>
                <Field label="Expiry Date"><Input type="date" value={form.expiryDate}
                                                  onChange={f("expiryDate")}/></Field>
                <Field label="Issued By"><Input value={form.issuedBy} onChange={f("issuedBy")}
                                                placeholder="Issuing authority"/></Field>
            </div>

            <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16}}>
                <button style={btnSecondary} onClick={onBack}>← Back</button>
                <button style={btnPrimary} onClick={handle} disabled={loading}>
                    {loading ? "Saving..." : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}

const Field = ({label, children}) => (
    <div style={{display: "flex", flexDirection: "column", gap: 3}}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
);
const Input = ({value, onChange, placeholder, type = "text"}) => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
           placeholder={placeholder} style={fieldStyle(false)}
           onFocus={e => (e.target.style.borderColor = "rgba(200,169,110,.5)")}
           onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
    />
);
const Select = ({value, onChange, options}) => (
    <select value={value} onChange={e => onChange(e.target.value)}
            style={{...fieldStyle(false), cursor: "pointer"}}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o}>{o}</option>)}
    </select>
);