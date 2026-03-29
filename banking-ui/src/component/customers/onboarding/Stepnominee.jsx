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
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        ) : (
            <input type={type || "text"} name={name} value={form[name] ?? ""} onChange={handle}
                   placeholder={placeholder} style={fieldStyle(false)}
                   onFocus={e => e.target.style.borderColor = "rgba(200,169,110,.5)"}
                   onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}/>
        )}
    </div>
);

export default function StepNominee({cifId, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        nomineeName: "", dob: "", relation: "", phone: "", email: "",
        panNumber: "", aadhaarNumber: "", addressLine1: "", addressLine2: "",
        city: "", state: "", postalCode: "", country: "India",
    });

    const handle = (e) => setForm(p => ({...p, [e.target.name]: e.target.value}));

    const submit = async () => {
        if (!form.nomineeName || !form.relation)
            return setError("Nominee name and relation are required.");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/nominee`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify(form),
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

            <div style={sectionTitle}>Nominee Personal Details</div>
            <div style={grid3}>
                <F {...p} label="Nominee Name" name="nomineeName" required/>
                <F {...p} label="Date of Birth" name="dob" type="date"/>
                <F {...p} label="Relation" name="relation" required options={[
                    "Spouse", "Father", "Mother", "Son", "Daughter",
                    "Brother", "Sister", "Grand Father", "Grand Mother", "Other"
                ]}/>
                <F {...p} label="Phone" name="phone"/>
                <F {...p} label="Email" name="email" type="email"/>
            </div>

            <div style={{...sectionTitle, marginTop: 16}}>Nominee ID Proof</div>
            <div style={grid2}>
                <F {...p} label="PAN Number" name="panNumber"/>
                <F {...p} label="Aadhaar Number" name="aadhaarNumber"/>
            </div>

            <div style={{...sectionTitle, marginTop: 16}}>Nominee Address</div>
            <div style={grid2}>
                <F {...p} label="Address Line 1" name="addressLine1"/>
                <F {...p} label="Address Line 2" name="addressLine2"/>
                <F {...p} label="City" name="city"/>
                <F {...p} label="State" name="state" options={STATES}/>
                <F {...p} label="Postal Code" name="postalCode"/>
                <F {...p} label="Country" name="country"/>
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