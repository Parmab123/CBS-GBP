import {useEffect, useState} from "react";
import {alert, btnPrimary, btnSecondary, fieldStyle, grid2, grid3, labelStyle, sectionTitle} from "./onboardingStyles";

const getLoggedInUser = () => {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) return "";
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.username || "";
    } catch {
        return "";
    }
};

const Field = ({label, children}) => (
    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
);

const focus = (e) => e.target.style.borderColor = "rgba(200,169,110,.5)";
const blur = (e) => e.target.style.borderColor = "rgba(255,255,255,.1)";

export default function StepDraft({onSuccess}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState([]);
    const [existingCustomer, setExistingCustomer] = useState(null);
    const [form, setForm] = useState({
        salutation: "",
        firstName: "",
        middlename: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        mobileNo: "",
        email: "",
        panNo: "",
        customertype: "INDIVIDUAL",
        customerSubType: "",
        createdBy: getLoggedInUser(),
        branchId: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        // Fetch branches
        fetch("http://localhost:8080/api/casa/branches", {
            headers: {Authorization: "Bearer " + token}
        })
            .then(r => r.json())
            .then(data => setBranches(Array.isArray(data) ? data : []))
            .catch(() => {
            });

        // Auto-fetch logged-in user's branch
        fetch("http://localhost:8080/api/users/my-branch", {
            headers: {Authorization: "Bearer " + token}
        })
            .then(r => r.json())
            .then(data => {
                if (data.branchId) setForm(p => ({...p, branchId: data.branchId}));
            })
            .catch(() => {
            });
    }, []);

    const handle = (e) => setForm(p => ({...p, [e.target.name]: e.target.value}));

    const submit = async () => {
        if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.mobileNo || !form.panNo)
            return setError("First name, last name, DOB, PAN and phone are required.");
        if (!form.branchId)
            return setError("Please select a home branch.");
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:8080/api/customers/draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify({
                    firstName: form.firstName,
                    middlename: form.middlename,
                    lastName: form.lastName,
                    salutation: form.salutation,
                    dob: form.dateOfBirth,
                    panNo: form.panNo,
                    mobileNo: form.mobileNo,
                    email: form.email,
                    customertype: form.customertype,
                    customerSubType: form.customerSubType,
                    createdBy: form.createdBy || getLoggedInUser(),
                    branchId: form.branchId,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed");
            const data = await res.json();
            onSuccess(data.cifId, form);
        } catch (e) {
            if (e.message.includes("duplicate key") || e.message.includes("pan_no") || e.message.includes("PAN")) {
                // Lookup existing customer by PAN
                try {
                    const all = await fetch("http://localhost:8080/api/customers", {
                        headers: {Authorization: "Bearer " + localStorage.getItem("accessToken")}
                    }).then(r => r.json());
                    const found = Array.isArray(all) ? all.find(c =>
                        (c.pan_no || "").toUpperCase() === form.panNo.toUpperCase()
                    ) : null;
                    setExistingCustomer(found || null);
                } catch {
                    setExistingCustomer(null);
                }
                setError("PAN number already exists. Each customer must have a unique PAN.");
            } else {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            {existingCustomer && (
                <div style={{
                    padding: "14px 16px", marginBottom: 14, borderRadius: 8,
                    background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)"
                }}>
                    <div style={{
                        fontSize: ".72rem", fontWeight: 700, color: "#f59e0b",
                        textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10
                    }}>
                        ⚠ Existing Customer Found with this PAN
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px 20px"}}>
                        {[
                            ["CIF ID", existingCustomer.cif_id],
                            ["Name", (existingCustomer.first_name || "") + " " + (existingCustomer.last_name || "")],
                            ["Mobile", existingCustomer.mobile_no],
                            ["PAN", existingCustomer.pan_no],
                            ["Status", existingCustomer.cif_status],
                            ["Created By", existingCustomer.created_by],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div
                                    style={{fontSize: ".62rem", color: "#6b7a99", textTransform: "uppercase"}}>{k}</div>
                                <div style={{
                                    fontSize: ".8rem", marginTop: 2, fontWeight: 500,
                                    fontFamily: k === "CIF ID" || k === "PAN" ? "IBM Plex Mono,monospace" : "inherit",
                                    color: k === "CIF ID" ? "#c8a96e" : "#e2e8f0"
                                }}>{v || "—"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Customer Type */}
            <div style={sectionTitle}>Customer Type</div>
            <div style={grid2}>
                <Field label="Customer Type *">
                    <select name="customertype" value={form.customertype} onChange={handle}
                            style={{...fieldStyle(false), cursor: "pointer"}}>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="CORPORATE">Corporate</option>
                        <option value="SME">SME</option>
                        <option value="NRI">NRI</option>
                    </select>
                </Field>
                <Field label="Customer Sub Type">
                    <select name="customerSubType" value={form.customerSubType} onChange={handle}
                            style={{...fieldStyle(false), cursor: "pointer"}}>
                        <option value="">Select</option>
                        <option value="SALARIED">Salaried</option>
                        <option value="SELF_EMPLOYED">Self Employed</option>
                        <option value="BUSINESS">Business</option>
                        <option value="STUDENT">Student</option>
                        <option value="RETIRED">Retired</option>
                        <option value="OTHER">Other</option>
                    </select>
                </Field>
            </div>

            {/* Customer Details */}
            <div style={{...sectionTitle, marginTop: 16}}>Customer Details</div>
            <div style={grid3}>
                <Field label="Salutation">
                    <select name="salutation" value={form.salutation} onChange={handle}
                            style={{...fieldStyle(false), cursor: "pointer"}}>
                        <option value="">Select</option>
                        <option value="MR">Mr.</option>
                        <option value="MRS">Mrs.</option>
                        <option value="MS">Ms.</option>
                        <option value="DR">Dr.</option>
                        <option value="PROF">Prof.</option>
                    </select>
                </Field>
                <Field label="First Name *">
                    <input name="firstName" value={form.firstName} onChange={handle}
                           placeholder="Enter first name" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Middle Name">
                    <input name="middlename" value={form.middlename} onChange={handle}
                           placeholder="Enter middle name" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Last Name *">
                    <input name="lastName" value={form.lastName} onChange={handle}
                           placeholder="Enter last name" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Date of Birth *">
                    {/*<input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handle}*/}
                    {/*       style={fieldStyle(false)} onFocus={focus} onBlur={blur}/>*/}


                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handle}
                           style={{
                               ...fieldStyle(false),
                               colorScheme: "dark"
                           }}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Gender">
                    <select name="gender" value={form.gender} onChange={handle}
                            style={{...fieldStyle(false), cursor: "pointer"}}>
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </Field>
                <Field label="PAN Number *">
                    <input name="panNo" value={form.panNo} onChange={handle}
                           placeholder="ABCDE1234F" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Phone Number *">
                    <input name="mobileNo" value={form.mobileNo} onChange={handle}
                           placeholder="Enter phone number" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
                <Field label="Email">
                    <input type="email" name="email" value={form.email} onChange={handle}
                           placeholder="Enter email address" style={fieldStyle(false)}
                           onFocus={focus} onBlur={blur}/>
                </Field>
            </div>

            {/* Branch & Created By */}
            <div style={{...sectionTitle, marginTop: 16}}>Branch & Officer Details</div>
            <div style={grid2}>
                <Field label="Home Branch *">
                    <select name="branchId" value={form.branchId} onChange={handle}
                            style={{...fieldStyle(false), cursor: "pointer"}}>
                        <option value="">Select Branch</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>
                                {b.branch_name} — {b.city}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Created By">
                    <input value={form.createdBy} disabled
                           placeholder="Auto from login" style={fieldStyle(true)}/>
                </Field>
            </div>

            {/* Action Buttons */}
            <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20}}>
                <button style={btnSecondary} onClick={() => window.history.back()}>Cancel</button>
                <button style={btnPrimary} onClick={submit} disabled={loading}>
                    {loading ? "Creating..." : "Create Draft →"}
                </button>
            </div>
        </div>
    );
}