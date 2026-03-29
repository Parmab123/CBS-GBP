// RiskRequest: incomeRange, occupation, politicallyExposedPerson (Boolean), riskCategory
import {useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid2, labelStyle, sectionTitle} from "./onboardingStyles";

export default function StepRisk({cifId, basicExt, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        riskCategory: "",
        incomeRange: "",
        occupation: basicExt?.occupation || "", // pre-fill from basic info
        politicallyExposedPerson: false,  // Boolean — matches DTO
        // UI-only fields
        riskScore: "", sanctionFlag: false, riskRemarks: "",
    });
    const f = (field) => (val) => setForm(p => ({...p, [field]: val}));

    const handle = async () => {
        if (!form.riskCategory) return setError("Risk category is required.");
        setLoading(true);
        setError("");
        try {
            // Exact RiskRequest fields — politicallyExposedPerson is Boolean
            const payload = {
                incomeRange: form.incomeRange,
                occupation: form.occupation,
                politicallyExposedPerson: form.politicallyExposedPerson, // true/false
                riskCategory: form.riskCategory,
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/risk`, {
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

            <div style={sectionTitle}>Risk Assessment</div>
            <div style={grid2}>
                <Field label="Risk Category *">
                    <Select value={form.riskCategory} onChange={f("riskCategory")}
                            options={["Low", "Medium", "High", "Very High"]}/>
                </Field>
                <Field label="Income Range">
                    <Select value={form.incomeRange} onChange={f("incomeRange")}
                            options={["Below 1L", "1L-5L", "5L-10L", "10L-25L", "25L-50L", "Above 50L"]}/>
                </Field>
                <Field label="Occupation">
                    <Select value={form.occupation} onChange={f("occupation")}
                            options={["Salaried", "Self-Employed", "Business", "Student", "Retired", "Housewife", "Other"]}/>
                </Field>
                <Field label="Risk Score (UI only)">
                    <Input type="number" value={form.riskScore} onChange={f("riskScore")} placeholder="e.g. 35"/>
                </Field>
            </div>

            <div style={{...sectionTitle, marginTop: 14}}>Compliance Flags</div>
            <div style={grid2}>
                <Field label="Politically Exposed Person (PEP)">
                    <Select
                        value={form.politicallyExposedPerson ? "true" : "false"}
                        onChange={v => f("politicallyExposedPerson")(v === "true")}
                        options={[{value: "false", label: "No"}, {value: "true", label: "Yes ⚠️"}]}
                    />
                </Field>
                <Field label="Sanction Flag (UI only)">
                    <Select
                        value={form.sanctionFlag ? "true" : "false"}
                        onChange={v => f("sanctionFlag")(v === "true")}
                        options={[{value: "false", label: "No"}, {value: "true", label: "Yes ⚠️"}]}
                    />
                </Field>
            </div>

            <div style={{marginTop: 10}}>
                <Field label="Risk Remarks (UI only)">
          <textarea value={form.riskRemarks} onChange={e => f("riskRemarks")(e.target.value)}
                    placeholder="Additional remarks..."
                    style={{...fieldStyle(false), minHeight: 70, resize: "vertical"}}
          />
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
        {options.map(o => typeof o === "object"
            ? <option key={o.value} value={o.value}>{o.label}</option>
            : <option key={o}>{o}</option>
        )}
    </select>
);