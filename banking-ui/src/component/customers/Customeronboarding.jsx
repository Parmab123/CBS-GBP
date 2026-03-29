import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import TopBar from "./TopBar";
import StepDraft from "./onboarding/StepDraft";
import StepBasicInfo from "./onboarding/StepBasicInfo";
import StepAddress from "./onboarding/StepAddress";
import StepNominee from "./onboarding/StepNominee";
import StepIncome from "./onboarding/StepIncome";
import StepKyc from "./onboarding/StepKyc";
import StepRisk from "./onboarding/StepRisk";
import StepSignature from "./onboarding/StepSignature";
import StepReview from "./onboarding/StepReview";

const STEPS = [
    {id: 1, label: "Draft", icon: "📋"},
    {id: 2, label: "Basic Info", icon: "👤"},
    {id: 3, label: "Address", icon: "🏠"},
    {id: 4, label: "Nominee", icon: "👥"},
    {id: 5, label: "Income", icon: "💰"},
    {id: 6, label: "KYC", icon: "🪪"},
    {id: 7, label: "Risk", icon: "⚠️"},
    {id: 8, label: "Signature", icon: "✍️"},
    {id: 9, label: "Review", icon: "✅"},
];

// Map onboarding_stage → NEXT step to do
// e.g. if stage is ADDRESS (done), resume at step 4 (Nominee)
const STAGE_TO_NEXT_STEP = {
    BASIC_INFO: 3,   // done basic info → go to Address
    ADDRESS: 4,   // done address    → go to Nominee
    NOMINEE: 5,   // done nominee    → go to Income
    INCOME: 6,   // done income     → go to KYC
    KYC: 7,   // done kyc        → go to Risk
    RISK: 8,   // done risk       → go to Signature
    FINAL_APPROVAL: 9,   // done all        → go to Review
};

export default function CustomerOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data collected from each step
    const [cifId, setCifId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [basicExt, setBasicExt] = useState(null);
    const [address, setAddress] = useState(null);
    const [nominee, setNominee] = useState(null);
    const [income, setIncome] = useState(null);
    const [kyc, setKyc] = useState(null);
    const [risk, setRisk] = useState(null);
    const [sig, setSig] = useState(null);

    // On mount — if ?cifId= in URL, fetch customer and resume from last stage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlCifId = params.get("cifId");

        // No cifId in URL → fresh new customer, start at step 1
        if (!urlCifId) {
            setStep(1);
            setCifId(null);
            setDraft(null);
            return;
        }

        // cifId in URL → resume existing draft
        setLoading(true);
        fetch(`http://localhost:8080/api/customers/${urlCifId}`, {
            headers: {Authorization: "Bearer " + localStorage.getItem("accessToken")}
        })
            .then(r => r.json())
            .then(data => {
                setCifId(urlCifId);
                setDraft({cifId: urlCifId, firstName: data.first_name, lastName: data.last_name});
                const stage = (data.onboarding_stage || "").toUpperCase().trim();
                const resumeStep = stage ? (STAGE_TO_NEXT_STEP[stage] ?? 2) : 2;
                console.log("[Resume] cifId:", urlCifId, "| stage from DB:", stage, "| jumping to step:", resumeStep);
                setStep(resumeStep);
            })
            .catch((err) => {
                console.error("[Resume] failed:", err);
                setStep(1);
            })
            .finally(() => setLoading(false));
    }, [window.location.search]);

    const stepProps = (id) => ({
        cifId,
        draft,
        basicExt,
        onBack: () => setStep(id - 1),
    });

    if (loading) return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100vh", background: "#0e1117", color: "#6b7a99",
            fontFamily: "IBM Plex Sans,sans-serif", flexDirection: "column", gap: 12
        }}>
            <div style={{fontSize: "1.5rem"}}>⏳</div>
            <div>Resuming your application...</div>
        </div>
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ob-root { min-height: 100vh; background: #0e1117; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; }
        .ob-nav {
          display: flex; align-items: center; gap: 12px;
          padding: 0 24px; height: 52px;
          background: #111827; border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .ob-back { display: flex; align-items: center; gap: 5px; background: none; border: none;
          color: #8a9bb5; cursor: pointer; font-size: .8rem; padding: 5px 8px;
          border-radius: 5px; font-family: inherit; transition: all .2s; }
        .ob-back:hover { background: rgba(255,255,255,.05); color: #e2e8f0; }
        .ob-back svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.5; }
        .ob-cif {
          margin-left: auto; font-size: .75rem; color: #c8a96e;
          background: rgba(200,169,110,.1); border: 1px solid rgba(200,169,110,.2);
          padding: 3px 10px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace;
        }
        .ob-stepper {
          display: flex; align-items: center;
          padding: 14px 24px 0; overflow-x: auto; gap: 0;
        }
        .ob-step { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 6px; flex-shrink: 0; }
        .ob-step.done { cursor: pointer; }
        .ob-step.done:hover { background: rgba(255,255,255,.04); }
        .ob-dot {
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: .72rem; font-weight: 700; flex-shrink: 0;
        }
        .ob-step.done    .ob-dot { background: rgba(72,199,142,.12); color: #48c78e; border: 1.5px solid #48c78e; }
        .ob-step.active  .ob-dot { background: rgba(200,169,110,.18); color: #c8a96e; border: 1.5px solid #c8a96e; }
        .ob-step.pending .ob-dot { background: rgba(255,255,255,.04); color: #6b7a99; border: 1.5px solid rgba(255,255,255,.08); }
        .ob-lbl { font-size: .73rem; font-weight: 600; }
        .ob-step.done    .ob-lbl { color: #48c78e; }
        .ob-step.active  .ob-lbl { color: #c8a96e; }
        .ob-step.pending .ob-lbl { color: #6b7a99; }
        .ob-conn { flex: 1; height: 1px; min-width: 12px; background: rgba(255,255,255,.07); }
        .ob-body { padding: 16px 24px 32px; }
        .ob-card { background: #161b26; border: 1px solid rgba(255,255,255,.07); border-radius: 8px; max-width: 860px; }
        .ob-head {
          padding: 10px 16px; background: rgba(200,169,110,.04);
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 8px;
        }
        .ob-head-title { font-size: .85rem; font-weight: 600; color: #c8a96e; }
        .ob-head-sub   { font-size: .7rem; color: #6b7a99; margin-left: auto; }
        .ob-card-body  { padding: 16px; }
      `}</style>

            <div className="ob-root">
                <TopBar breadcrumb={[{
                    label: "Customer Operations",
                    path: "/customers"
                }, {label: "Onboarding"}, {label: cifId || "New Customer"}]}/>
                {/* NAV */}
                <nav className="ob-nav">
                    <button className="ob-back" onClick={() => navigate("/customers")}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Customers
                    </button>
                    <div style={{width: 1, height: 20, background: "rgba(255,255,255,.1)"}}/>
                    <span style={{fontSize: ".9rem", fontWeight: 600}}>Customer Onboarding</span>
                    {cifId && <span className="ob-cif">CIF: {cifId}</span>}
                </nav>

                {/* STEPPER */}
                <div className="ob-stepper">
                    {STEPS.map((s, i) => {
                        const state = step > s.id ? "done" : step === s.id ? "active" : "pending";
                        return (
                            <div key={s.id} style={{display: "contents"}}>
                                <div className={`ob-step ${state}`}
                                     onClick={() => state === "done" && setStep(s.id)}>
                                    <div className="ob-dot">{state === "done" ? "✓" : s.icon}</div>
                                    <span className="ob-lbl">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className="ob-conn"/>}
                            </div>
                        );
                    })}
                </div>

                {/* STEP CARDS */}
                <div className="ob-body">
                    <div className="ob-card">
                        <div className="ob-head">
                            <span>{STEPS[step - 1].icon}</span>
                            <span className="ob-head-title">{STEPS[step - 1].label}</span>
                            <span className="ob-head-sub">Step {step} of {STEPS.length}</span>
                        </div>
                        <div className="ob-card-body">

                            {step === 1 && <StepDraft onSuccess={(id, data) => {
                                setCifId(id);
                                setDraft(data);
                                setStep(2);
                            }}/>}

                            {step === 2 && <StepBasicInfo {...stepProps(2)}
                                                          onSuccess={(ext) => {
                                                              setBasicExt(ext);
                                                              setStep(3);
                                                          }}/>}

                            {step === 3 && <StepAddress {...stepProps(3)}
                                                        onSuccess={(data) => {
                                                            setAddress(data);
                                                            setStep(4);
                                                        }}/>}

                            {step === 4 && <StepNominee cifId={cifId} onBack={() => setStep(3)}
                                                        onSuccess={(data) => {
                                                            setNominee(data);
                                                            setStep(5);
                                                        }}/>}

                            {step === 5 && <StepIncome cifId={cifId} onBack={() => setStep(4)}
                                                       onSuccess={(data) => {
                                                           setIncome(data);
                                                           setStep(6);
                                                       }}/>}

                            {step === 6 && <StepKyc {...stepProps(6)}
                                                    onSuccess={(data) => {
                                                        setKyc(data);
                                                        setStep(7);
                                                    }}/>}

                            {step === 7 && <StepRisk cifId={cifId} basicExt={basicExt} onBack={() => setStep(6)}
                                                     onSuccess={(data) => {
                                                         setRisk(data);
                                                         setStep(8);
                                                     }}/>}

                            {step === 8 && <StepSignature cifId={cifId} onBack={() => setStep(7)}
                                                          onSuccess={(data) => {
                                                              setSig(data);
                                                              setStep(9);
                                                          }}/>}

                            {step === 9 && <StepReview cifId={cifId} draft={draft} basicExt={basicExt}
                                                       address={address} kyc={kyc} risk={risk} sig={sig}
                                                       onBack={() => setStep(8)}/>}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}