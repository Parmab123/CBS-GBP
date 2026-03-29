// AddressRequest: addressType, addressLine1, addressLine2, city, state, postalCode, country
import {useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid2, grid3, labelStyle} from "./onboardingStyles";

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Other"];

export default function StepAddress({cifId, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        addressType: "Permanent", addressLine1: "", addressLine2: "",
        city: "", state: "", postalCode: "", country: "India",
    });
    const f = (field) => (val) => setForm(p => ({...p, [field]: val}));

    const handle = async () => {
        if (!form.addressLine1 || !form.city || !form.postalCode)
            return setError("Address line 1, city and pincode are required.");
        setLoading(true);
        setError("");
        try {
            // Exact AddressRequest fields
            const payload = {
                addressType: form.addressType,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country,
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/address`, {
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

            <div style={grid2}>
                <Field label="Address Type">
                    <Select value={form.addressType} onChange={f("addressType")}
                            options={["Permanent", "Current", "Office", "Other"]}/>
                </Field>
                <Field label="Country">
                    <Input value={form.country} onChange={f("country")} placeholder="Country"/>
                </Field>
            </div>

            <div style={{marginTop: 10}}>
                <Field label="Address Line 1 *"><Input value={form.addressLine1} onChange={f("addressLine1")}
                                                       placeholder="House / Flat / Plot No."/></Field>
            </div>
            <div style={{marginTop: 8}}>
                <Field label="Address Line 2"><Input value={form.addressLine2} onChange={f("addressLine2")}
                                                     placeholder="Street / Area / Locality"/></Field>
            </div>

            <div style={{...grid3, marginTop: 10}}>
                <Field label="City *"><Input value={form.city} onChange={f("city")} placeholder="City"/></Field>
                <Field label="State">
                    <Select value={form.state} onChange={f("state")} options={STATES}/>
                </Field>
                <Field label="Pincode *"><Input value={form.postalCode} onChange={f("postalCode")}
                                                placeholder="6-digit pincode"/></Field>
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