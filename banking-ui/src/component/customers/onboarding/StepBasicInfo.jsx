import {useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid3, labelStyle, sectionTitle} from "./onboardingStyles";

// ── Outside component to prevent remount ──────────────────────────────────────
const Field = ({label, children}) => (
    <div style={{display: "flex", flexDirection: "column", gap: 3}}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
);

const Input = ({value, onChange, placeholder, type = "text", disabled}) => (
    <input type={type} value={value || ""} onChange={e => onChange && onChange(e.target.value)}
           placeholder={placeholder} disabled={disabled}
           style={{...fieldStyle(disabled), colorScheme: "dark"}}
           onFocus={e => !disabled && (e.target.style.borderColor = "rgba(200,169,110,.5)")}
           onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}/>
);

const Select = ({value, onChange, options}) => (
    <select value={value || ""} onChange={e => onChange(e.target.value)}
            style={{...fieldStyle(false), cursor: "pointer"}}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o}>{o}</option>)}
    </select>
);

export default function StepBasicInfo({cifId, draft, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Pre-populate from draft — draft has dateOfBirth and gender
    const [ext, setExt] = useState({
        middleName: draft?.middlename || "",
        gender: draft?.gender || "",
        maritalStatus: "",
        nationality: "Indian",
        occupation: draft?.customerSubType || "",
        altMobile: "",
        aadharNo: "",
        fatherName: "",
        motherName: "",
        spouseName: "",
    });

    const f = (field) => (val) => setExt(p => ({...p, [field]: val}));

    const handle = async () => {
        setLoading(true);
        setError("");
        try {
            const payload = {
                firstName: draft?.firstName || "",
                lastName: draft?.lastName || "",
                mobileNo: draft?.mobileNo || "",
                email: draft?.email || "",
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/basic-info`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed");
            onSuccess(ext);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // DOB from draft — StepDraft saves as dateOfBirth
    const dob = draft?.dateOfBirth || draft?.dob || "";

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            <div style={sectionTitle}>Name Details</div>
            <div style={grid3}>
                <Field label="First Name">
                    <Input value={draft?.firstName} disabled/>
                </Field>
                <Field label="Middle Name">
                    <Input value={ext.middleName} onChange={f("middleName")} placeholder="Middle name"/>
                </Field>
                <Field label="Last Name">
                    <Input value={draft?.lastName} disabled/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Personal Details</div>
            <div style={grid3}>
                <Field label="Date of Birth">
                    {/* Auto-populated from draft */}
                    <Input type="date" value={dob} disabled/>
                </Field>
                <Field label="Gender">
                    {/* Auto-populated from draft if selected */}
                    <Select value={ext.gender} onChange={f("gender")}
                            options={["Male", "Female", "Other"]}/>
                </Field>
                <Field label="Marital Status">
                    <Select value={ext.maritalStatus} onChange={f("maritalStatus")}
                            options={["Single", "Married", "Divorced", "Widowed"]}/>
                </Field>
                <Field label="Nationality">
                    <Input value={ext.nationality} onChange={f("nationality")} placeholder="Nationality"/>
                </Field>
                <Field label="Occupation">
                    <Select value={ext.occupation} onChange={f("occupation")}
                            options={["Salaried", "Self-Employed", "Business", "Student", "Retired", "Housewife", "Other"]}/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Contact Details</div>
            <div style={grid3}>
                <Field label="Mobile Number">
                    <Input value={draft?.mobileNo} disabled/>
                </Field>
                <Field label="Alternate Mobile">
                    <Input value={ext.altMobile} onChange={f("altMobile")} placeholder="Alternate number"/>
                </Field>
                <Field label="Email">
                    <Input value={draft?.email} disabled/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Identity</div>
            <div style={grid3}>
                <Field label="PAN Number">
                    <Input value={draft?.panNo} disabled/>
                </Field>
                <Field label="Aadhaar Number">
                    <Input value={ext.aadharNo} onChange={f("aadharNo")} placeholder="12-digit Aadhaar"/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Family Details</div>
            <div style={grid3}>
                <Field label="Father's Name">
                    <Input value={ext.fatherName} onChange={f("fatherName")} placeholder="Father's full name"/>
                </Field>
                <Field label="Mother's Name">
                    <Input value={ext.motherName} onChange={f("motherName")} placeholder="Mother's full name"/>
                </Field>
                <Field label="Spouse Name">
                    <Input value={ext.spouseName} onChange={f("spouseName")} placeholder="Spouse's full name"/>
                </Field>
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