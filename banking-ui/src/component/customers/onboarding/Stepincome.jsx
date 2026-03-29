import {useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid2, grid3, labelStyle, sectionTitle} from "./onboardingStyles";

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Other"
];

// ── F must be OUTSIDE the component to prevent remount on every keystroke ─────
const F = ({label, name, type, required, options, placeholder, form, handle}) => (
    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
        <label style={labelStyle}>{label}{required && " *"}</label>
        {options ? (
            <select name={name} value={form[name] ?? ""} onChange={handle}
                    style={{...fieldStyle(false), cursor: "pointer"}}>
                <option value="">Select</option>
                {options.map(o => typeof o === "object"
                    ? <option key={o.v} value={o.v}>{o.l}</option>
                    : <option key={o} value={o}>{o}</option>
                )}
            </select>
        ) : (
            <input type={type || "text"} name={name} value={form[name] ?? ""} onChange={handle}
                   placeholder={placeholder} style={fieldStyle(false)}
                   onFocus={e => e.target.style.borderColor = "rgba(200,169,110,.5)"}
                   onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}/>
        )}
    </div>
);

export default function StepIncome({cifId, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        incomeSource: "", annualIncome: "", employerName: "", employerAddress: "",
        employerCity: "", employerState: "", employerPincode: "",
        itrFiled: "false", itrYear: "", itrAmount: "",
        bankAccountNumber: "", bankName: "", bankIfsc: "", bankBranch: "",
    });

    const handle = (e) => setForm(p => ({...p, [e.target.name]: e.target.value}));

    const submit = async () => {
        if (!form.incomeSource)
            return setError("Income source is required.");
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...form,
                annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : null,
                itrFiled: form.itrFiled === "true",
                itrAmount: form.itrAmount ? parseFloat(form.itrAmount) : null,
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/income`, {
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

    const p = {form, handle};

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            <div style={sectionTitle}>Income Details</div>
            <div style={grid3}>
                <F {...p} label="Income Source" name="incomeSource" required options={[
                    "Salary", "Business", "Self-Employed", "Rental", "Agriculture", "Pension", "Other"
                ]}/>
                <F {...p} label="Annual Income (₹)" name="annualIncome" type="number" placeholder="e.g. 500000"/>
            </div>

            <div style={{...sectionTitle, marginTop: 16}}>Employer Details</div>
            <div style={grid2}>
                <F {...p} label="Employer Name" name="employerName" placeholder="Company / Organization"/>
                <F {...p} label="Employer Address" name="employerAddress" placeholder="Office address"/>
                <F {...p} label="Employer City" name="employerCity"/>
                <F {...p} label="Employer State" name="employerState" options={STATES}/>
                <F {...p} label="Employer Pincode" name="employerPincode"/>
            </div>

            <div style={{...sectionTitle, marginTop: 16}}>ITR / Tax Details</div>
            <div style={grid3}>
                <F {...p} label="ITR Filed?" name="itrFiled" options={[
                    {v: "false", l: "No"}, {v: "true", l: "Yes"}
                ]}/>
                {form.itrFiled === "true" && <>
                    <F {...p} label="ITR Year" name="itrYear" placeholder="e.g. 2024-25"/>
                    <F {...p} label="ITR Amount (₹)" name="itrAmount" type="number" placeholder="e.g. 50000"/>
                </>}
            </div>

            <div style={{...sectionTitle, marginTop: 16}}>Bank Account Details</div>
            <div style={grid2}>
                <F {...p} label="Account Number" name="bankAccountNumber" placeholder="Enter account number"/>
                <F {...p} label="Bank Name" name="bankName" placeholder="e.g. State Bank of India"/>
                <F {...p} label="IFSC Code" name="bankIfsc" placeholder="e.g. SBIN0001234"/>
                <F {...p} label="Branch" name="bankBranch" placeholder="Branch name"/>
            </div>

            <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16}}>
                <button style={btnSecondary} onClick={onBack}>← Back</button>
                <button style={btnPrimary} onClick={submit} disabled={loading}>
                    {loading ? "Saving..." : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}